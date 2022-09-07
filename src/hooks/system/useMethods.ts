import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';
import { useGlobSetting } from '/@/hooks/setting';
import { read, utils, writeFile, WorkBook } from 'xlsx';

const { createMessage, createWarningModal } = useMessage();
const glob = useGlobSetting();

/**
 * 导出文件xlsx的mime-type
 */
export const XLSX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
/**
 * 导出文件xlsx的文件后缀
 */
export const XLSX_FILE_SUFFIX = '.xlsx';

export function useMethods() {
  /**
   * 导出xls
   * @param name
   * @param url
   */
  async function exportXls(name, url, params, isXlsx = false) {
    const data = await defHttp.get({ url: url, params: params, responseType: 'blob' }, { isTransformResponse: false });
    if (!data) {
      createMessage.warning('文件下载失败');
      return;
    }
    if (!name || typeof name != 'string') {
      name = '导出文件';
    }
    let blobOptions = { type: 'application/vnd.ms-excel' };
    let fileSuffix = '.xls';
    if (isXlsx === true) {
      blobOptions['type'] = XLSX_MIME_TYPE;
      fileSuffix = XLSX_FILE_SUFFIX;
    }
    if (typeof window.navigator['msSaveBlob'] !== 'undefined') {
      window.navigator['msSaveBlob'](new Blob([data], blobOptions), name + fileSuffix);
    } else {
      let url = window.URL.createObjectURL(new Blob([data], blobOptions));
      let link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.setAttribute('download', name + fileSuffix);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link); //下载完成移除元素
      window.URL.revokeObjectURL(url); //释放掉blob对象
    }
  }

  /**
   * 导出空excel（只有表头）
   * @param name
   * @param url
   */
  async function exportEmptyXls(name, url, params, isXlsx = false) {
    // 此处无论param是什么都会返回一个包含所有表格信息的xlsx的blob 而且对应的后端在java的包里 这里自己实现一个方法
    const data = await defHttp.get({ url: url, params: params, responseType: 'blob' }, { isTransformResponse: false });
    if (!data) {
      createMessage.warning('文件下载失败');
      return;
    }
    if (!name || typeof name != 'string') {
      name = '导出文件';
    }
    let blobOptions = { type: 'application/vnd.ms-excel' };
    let fileSuffix = '.xls';
    if (isXlsx === true) {
      blobOptions['type'] = XLSX_MIME_TYPE;
      fileSuffix = XLSX_FILE_SUFFIX;
    }

    // 转换器 利用sheetJs读入全表格的sheet返回只有表头的Blob
    const getNewBookWithHeader = (originWb: Blob): Promise<WorkBook> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const wbBuffer = e.target!.result as ArrayBuffer;
          const wb = read(wbBuffer);
          // 获取第一个sheet的所有数据
          const rows = utils.sheet_to_json<string[]>(wb.Sheets[wb.SheetNames[0]], { header: 1 });
          // 取表头
          const header = rows[0];

          // 写入新表
          const newSheet = utils.json_to_sheet([], { header });
          const newBook = utils.book_new();
          utils.book_append_sheet(newBook, newSheet, wb.SheetNames[0]);

          resolve(newBook);
        };
        reader.readAsArrayBuffer(originWb);
      });
    };

    const newWb = await getNewBookWithHeader(new Blob([data], blobOptions));
    writeFile(newWb, name + fileSuffix);
  }

  /**
   * 导入xls
   * @param data 导入的数据
   * @param url
   * @param success 成功后的回调
   */
  async function importXls(data, url, success) {
    const isReturn = (fileInfo) => {
      try {
        if (fileInfo.code === 201) {
          let {
            message,
            result: { msg, fileUrl, fileName },
          } = fileInfo;
          let href = glob.uploadUrl + fileUrl;
          createWarningModal({
            title: message,
            centered: false,
            content: `<div>
                                <span>${msg}</span><br/> 
                                <span>具体详情请<a href = ${href} download = ${fileName}> 点击下载 </a> </span> 
                              </div>`,
          });
          //update-begin---author:wangshuai ---date:20221121  for：[VUEN-2827]导入无权限，提示图标错误------------
        } else if (fileInfo.code === 500 || fileInfo.code === 510) {
          createMessage.error(fileInfo.message || `${data.file.name} 导入失败`);
          //update-end---author:wangshuai ---date:20221121  for：[VUEN-2827]导入无权限，提示图标错误------------
        } else {
          createMessage.success(fileInfo.message || `${data.file.name} 文件上传成功`);
        }
      } catch (error) {
        console.log('导入的数据异常', error);
      } finally {
        typeof success === 'function' ? success(fileInfo) : '';
      }
    };
    await defHttp.uploadFile({ url }, { file: data.file }, { success: isReturn });
  }

  return {
    handleExportXls: (name: string, url: string, params?: object) => exportXls(name, url, params),
    handleImportXls: (data, url, success) => importXls(data, url, success),
    handleExportXlsx: (name: string, url: string, params?: object) => exportXls(name, url, params, true),
    handleEmptyExportXlsx: (name: string, url: string, params?: object) => exportEmptyXls(name, url, params, true),
  };
}

import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import { rules} from '/@/utils/helper/validator';
import { render } from '/@/utils/common/renderUtils';
//列表数据
export const columns: BasicColumn[] = [
   {
    title: '市',
    align:"center",
    dataIndex: 'city',
    customRender:({text}) => {
       return  render.renderCategoryTree(text,'B05')
   },
   },
   {
    title: '行业领域',
    align:"center",
    dataIndex: 'category_dictText'
   },
   {
    title: '环境管理问题',
    align:"center",
    dataIndex: 'question'
   },
   {
    title: '环境数据文件',
    align:"center",
    dataIndex: 'dataDoc',
    slots: { customRender: 'fileSlot' },
   },
   {
    title: '环境数据链接',
    align:"center",
    dataIndex: 'dataLink'
   },
   {
    title: '需求',
    align:"center",
    dataIndex: 'need'
   },
   {
    title: '项目',
    align:"center",
    dataIndex: 'project'
   },
];
//查询数据
export const searchFormSchema: FormSchema[] = [
];
//表单数据
export const formSchema: FormSchema[] = [
  {
    label: '市',
    field: 'city',
    component: 'JCategorySelect',
    componentProps:{
       pcode:"B05", //TODO back和事件未添加，暂时有问题
    },
  },
  {
    label: '行业领域',
    field: 'category',
    component: 'JSelectMultiple',
    componentProps:{
        dictCode:"hjkxxh_category"
     },
  },
  {
    label: '环境管理问题',
    field: 'question',
    component: 'Input',
  },
  {
    label: '环境数据文件',
    field: 'dataDoc',
    component: 'JUpload',
    componentProps:{
     },
  },
  {
    label: '环境数据链接',
    field: 'dataLink',
    component: 'Input',
  },
  {
    label: '需求',
    field: 'need',
    component: 'Input',
  },
  {
    label: '项目',
    field: 'project',
    component: 'Input',
  },
	// TODO 主键隐藏字段，目前写死为ID
	{
	  label: '',
	  field: 'id',
	  component: 'Input',
	  show: false
	},
];

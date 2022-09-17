<template>
  <div class="l-page">
    <div class="l-item"> 共搜到数据{{ total }}条，搜索结果如下： </div>
    <template v-for="tableInfo in tableInfoList">
      <div class="l-item">
        <router-link :to="`/online/cgformList/${tableInfo.value}`" class="l-item__title">{{ tableInfo.label }}</router-link>
        <a-table :columns="tableInfo.columns" :data-source="tableInfo.dataSource" :pagination="false" :row-key="(record) => record.id"> </a-table>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts" name="search-result">
  import { from, zip } from 'rxjs';
import { map } from 'rxjs/operators';
import { reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { getOptions } from '../utils/common-func';
import { BasicColumn } from '/@/components/Table';
import { defHttp } from '/@/utils/http/axios';

  const queryItem = useRoute().query.name as string;
  const tableInfoList: { label: string; value: string; columns: BasicColumn[]; dataSource: Array<Record<string, any>> }[] = reactive([]);
  const total = ref(0);
  console.log(queryItem);

  // 获取tab数据 用于数据请求
  const options = getOptions();

  getTableData();

  function getTableData() {
    const getDataQuery = (code: string, query: { key: string; value: string }) => {
      return {
        url: `online/cgform/api/getData/${code}`,
        params: {
          hasQuery: true,
          column: 'id',
          order: 'asc',
          pageNo: 1,
          pageSize: 1000,
          superQueryMatchType: 'and',
          superQueryParams: encodeURIComponent(`[{"field":"${query.key}","rule":"like","val":"%${query.value}%","type":"text","dbType":"string"}]`),
        },
      };
    };

    const zipObservable = options.map((option) => {
      const baseCode = option.value;
      const queryKey = option.queryItem ?? 'name';

      return zip(from(defHttp.get({ url: `/online/cgform/api/getColumns/${baseCode}` })), from(defHttp.get(getDataQuery(baseCode, { key: queryKey, value: queryItem })))).pipe(
        map(
          (
            result: [
              {
                columns: BasicColumn[];
                currentTableName: string;
                //  表描述 作为表名
                description: string;
              },
              {
                records: Array<Record<string, any>>;
              }
            ]
          ) => {
            console.log(result);
            // 删除customRender属性
            result[0].columns.forEach((column) => {
              if ('customRender' in column) {
                delete column.customRender;
              }
            });

            return {
              label: option.label,
              value: baseCode,
              columns: result[0].columns,
              dataSource: result[1].records,
            };
          }
        )
      );
    });
    zip(zipObservable).subscribe((tableData) => {
      tableInfoList.push(...tableData);
      // 计算总的搜索条目数量
      total.value = tableInfoList.reduce((acc, curr) => {
        return acc + curr.dataSource.length;
      }, 0);
    });
  }
</script>

<style lang="less" scoped>
  .l-page {
    padding: 0.5rem;
  }
  .l-item {
    display: flex;
    flex-direction: column;
    padding: 10px 10px;

    background-color: white;
    margin-bottom: 15px;

    &__title {
      margin-bottom: 12px;
      font-weight: 700;
      font-size: 22px;
      line-height: 36px;
    }
  }
</style>

<template>
  <div class="l-page">
    <img src="../../../assets/images/society/society-logo.png" alt="society-logo" class="l-logo" />

    <div class="l-title">四川省环境科学信息资源平台</div>
    <div class="l-form">
      <a-select v-model:value="formData.type" :options="options" class="a-select" size="large"></a-select>
      <a-input-search v-model:value="formData.keyword" placeholder="请输入关键字进行搜索" enter-button="搜索" size="large" @search="onSearch" class="a-input" />
    </div>
  </div>
</template>

<script setup lang="ts" name="search-result">
  import { reactive, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { getOptions, OptionType } from '../utils/common-func';

  const router = useRouter();
  const formData = reactive({
    type: 'all',
    keyword: '',
  });

  // 选择query类型
  const options = ref<OptionType[]>([
    {
      value: 'all',
      label: '全部分类',
    },
  ]);
  getAllOptions();

  function onSearch(e: string) {
    // 不搜索空
    if (!formData.keyword) {
      return;
    }

    // 跳转到搜索全部页面
    if (formData.type === 'all') {
      router.push({ path: '/society/result', query: { name: formData.keyword } });
    } else {
      const option = options.value.find((o) => {
        return o.value === formData.type;
      }) as OptionType;

      // 设置搜索内容
      const storage = window.localStorage;
      const queryItem: { [key: string]: string } = {};
      const queryKey = option.queryItem ?? 'name';
      queryItem[queryKey] = formData.keyword;

      storage.setItem('query_form_data', JSON.stringify(queryItem));

      // 跳转到对应页面
      router.push(option.value);
    }
  }

  function getAllOptions() {
    options.value.push(
      ...getOptions().map((option) => {
        return {
          ...option,
          value: `/online/cgformList/${option.value}`,
        };
      })
    );
  }
</script>

<style lang="less" scoped>
  .l-page {
    width: 100%;
    height: 100%;
    background: url('../../../assets/images/society/search-bg.png') no-repeat;
    background-size: 100% 100%;
    position: relative;
    z-index: 1;

    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .l-logo {
    position: absolute;
    left: 2%;
    top: 2%;

    max-width: 20%;
    z-index: 10;
  }

  .l-title {
    margin-top: 15%;
    margin-bottom: 20px;
    font-size: 52px;
    color: white;
    font-weight: bold;
  }
  .l-form {
    margin-bottom: auto;
    display: flex;
    height: 48px;
    width: 38%;
    align-items: center;
    justify-content: center;

    .a-select {
      flex: 0 0 25%;

      :deep(.ant-select-selector) {
        padding-left: 15px;
        border-radius: 18px 0 0 18px;
      }
    }
    .a-input {
      flex: 1;

      :deep(.ant-btn-primary) {
        border-radius: 0 18px 18px 0;
      }
      :deep(.ant-input-group-addon) {
        border-radius: 0 18px 18px 0;
      }
    }
  }
</style>

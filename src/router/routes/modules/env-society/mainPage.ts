import type { AppRouteModule } from '/@/router/types';

import { LAYOUT } from '/@/router/constant';
import { t } from '/@/hooks/web/useI18n';

// 增加环境学会的主路由 包含首页和搜索结果
const mainPage: AppRouteModule = {
  path: '/society',
  name: 'Society',
  component: LAYOUT,
  redirect: '/society/home',
  meta: {
    orderNo: 10,
    icon: 'ion:grid-outline',
    title: '四川环境学会',
  },
  children: [
    {
      path: 'home',
      name: '首页',
      component: () => import('/@/views/env-society/search/index.vue'),
      meta: {
        // affix: true,
        title: '首页',
      },
    },
    {
      path: 'result',
      name: '搜索结果',
      component: () => import('/@/views/env-society/search-result/index.vue'),
      meta: {
        title: '搜索结果',
      },
    },
  ],
};

export default mainPage;

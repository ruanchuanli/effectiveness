/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { Component } from 'vue'
import utils from '@/utils'

// All TSX files under the views folder automatically generate mapping relationship
const modules = import.meta.glob('/src/views/**/**.tsx')
const components: { [key: string]: Component } = utils.mapping(modules)

export default {
  path: '/theme-data',
  name: 'theme-data',
  meta: { title: '主题数据' },
  // redirect: { name: 'theme-data-index' },
  component: () => import('@/layouts/content'),
  children: [
    {
      path: '',
      name: 'theme-data-index',
      component: components['theme-data'],
      meta: {
        title: '主题数据',
        activeMenu: 'theme-data',
        showSide: false,
        auth: []
      }
    }
    // {
    //   path: '/theme-data/equipment-dir',
    //   name: 'equipment-dir',
    //   component: components['theme-data-equipment-dir'],
    //   meta: {
    //     title: '装备目录',
    //     activeMenu: 'theme-data',
    //     showSide: true,
    //     auth: []
    //   }
    // },
    // {
    //   path: '',
    //   name: '',
    //   component: components[''],
    //   meta: {
    //     title: '分系统目录',
    //     activeMenu: 'theme-data',
    //     showSide: true,
    //     auth: []
    //   }
    // },
    // {
    //   path: '',
    //   name: '',
    //   component: components[''],
    //   meta: {
    //     title: '器材目录',
    //     activeMenu: 'theme-data',
    //     showSide: true,
    //     auth: []
    //   }
    // },
    // {
    //   path: '',
    //   name: '',
    //   component: components[''],
    //   meta: {
    //     title: '装备指标体系列表',
    //     activeMenu: 'theme-data',
    //     showSide: true,
    //     auth: []
    //   }
    // },
    // {
    //   path: '',
    //   name: '',
    //   component: components[''],
    //   meta: {
    //     title: '分系统指标体系列表',
    //     activeMenu: 'theme-data',
    //     showSide: true,
    //     auth: []
    //   }
    // },
    // {
    //   path: '',
    //   name: '',
    //   component: components[''],
    //   meta: {
    //     title: '性能试验标准装备作战试验指南',
    //     activeMenu: 'theme-data',
    //     showSide: true,
    //     auth: []
    //   }
    // },
    // {
    //   path: '',
    //   name: '',
    //   component: components[''],
    //   meta: {
    //     title: '利率及CPI列表',
    //     activeMenu: 'theme-data',
    //     showSide: true,
    //     auth: []
    //   }
    // }
  ]
}

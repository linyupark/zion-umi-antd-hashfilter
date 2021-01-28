/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useState } from 'react'
import { Table } from 'antd'
import { TablePaginationConfig, TableProps } from 'antd/lib/table'
import Emitter from './emitter'
import Util from './util'
import 'antd/lib/table/style'
import 'antd/lib/pagination/style'

interface HashFilterTableProps extends TableProps<any> {
  columns: any
  data: any
  columnsMap?: any // columns 内容修正
  itemsKey?: string
  currentPageKey?: string
  pageSizeKey?: string
  totalItemsKey?: string
  pageSelector?: string // form 所在容器选择器
  formSelector?: string // form 选择器
  scrollOffsetY?: number // Y轴滚动条修正
  paginationProps?: TablePaginationConfig
}

const HashFilterTable = (props: HashFilterTableProps) => {
  const [scroll, setScroll] = useState(props.scroll)
  const columnsMap =
    props.columnsMap ??
    function (col) {
      return col
    }
  const itemsKey = props.itemsKey ?? 'items'
  const currentPageKey = props.currentPageKey ?? 'current'
  const pageSizeKey = props.pageSizeKey ?? 'pageSize'
  const totalItemsKey = props.totalItemsKey ?? 'totalItems'
  const pageSelector = props.pageSelector ?? '.ant-layout-content'
  const formSelector = props.formSelector ?? '.ant-form'
  const paginationProps = props.paginationProps ?? {}

  // props 过滤器
  const excludeProps = [
    'columnsMap',
    'itemsKey',
    'currentPageKey',
    'pageSizeKey',
    'totalItemsKey',
    'pageSelector',
    'formSelector',
    'scrollOffsetY',
    'paginationProps',
  ]

  // 列翻译补全数据
  const columns = props.columns
    .map(col => {
      if (!col.dataIndex) col.dataIndex = col.key
      // 设置一个默认的宽度
      if (!col.width) col.width = 100
      // 設置默認沒有數據顯示 --
      if (!col.render) col.render = text => text || '--'
      return col
    })
    .map(columnsMap)

  // console.log('columns', columns)

  const dataSource = useMemo(() => {
    if (!props.data) return null
    // [config]根據實際接口表單所在結構位置定位
    return props.data[itemsKey]
  }, [props.data])

  // [config]根據實際項目修改結構
  const pagination: TablePaginationConfig | false = useMemo(() => {
    if (!props.data) {
      return false
    }

    // 不支持分頁的就關閉功能
    if (!props.data[pageSizeKey] && !props.data[currentPageKey]) return false

    return {
      position: ['bottomCenter'],
      current: props.data[currentPageKey],
      pageSize: props.data[pageSizeKey],
      total: props.data[totalItemsKey],
      onChange: (page, pageSize) => {
        Emitter.emit('onPaginationChange', {
          current: page,
          pageSize,
        })
      },
      hideOnSinglePage: true,
      ...paginationProps,
    }
  }, [props.data])

  // 窗口变动自动调整table scroll y来确保头部固定
  const onWindowResize = () => {
    const $page = document.querySelector(pageSelector)
    const $form = $page?.querySelector(formSelector)
    const tableHeight = $page!.clientHeight - $form!.clientHeight

    setScroll({
      ...scroll,
      y: tableHeight - 160 + (props.scrollOffsetY || 0),
    })
  }

  useEffect(() => {
    onWindowResize()
    window.addEventListener('resize', onWindowResize, false)
    return () => window.removeEventListener('resize', onWindowResize, false)
  }, [])

  const formProps = Util.objectFilter(props, (_, k) => {
    return excludeProps.indexOf(k) === -1
  })

  return (
    <Table
      {...formProps}
      scroll={scroll}
      columns={columns}
      dataSource={dataSource}
      pagination={pagination}
    />
  )
}

export default HashFilterTable

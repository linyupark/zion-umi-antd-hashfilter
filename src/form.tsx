import { useEffect, useMemo } from 'react'
import { Form } from 'antd'
import qs from 'qs'
import { useLocation } from 'umi'
import moment from 'moment'
import Emitter from './emitter'
import Util from './util'
import { FormProps } from 'antd/lib/form/Form'
import 'antd/lib/form/style'

interface HashFilterFormProps extends FormProps {
  initData?: any
  currentPageKey?: string
  pageSizeKey?: string
}

const isObject = mixed => Util.typeOf(mixed) === 'Object'
const isString = mixed => Util.typeOf(mixed) === 'String'

// 处理特殊的数据对象比如 moment
const hashObjectStringify = values => {
  let output

  if (Array.isArray(values)) {
    output = []
    values.map((item, i) => {
      output[i] = hashObjectStringify(item)
    })
    return output
  }

  if (isObject(values)) {
    if (values.hasOwnProperty('_isAMomentObject')) {
      output = values.format('YYYY-MM-DD HH:mm:ss')
      return output
    }

    output = {}
    Object.keys(values).map(key => {
      output[key] = hashObjectStringify(values[key])
    })
    return output
  }

  return values
}

// hash 转换回表单提交数据特殊数据转换
const hashObjectParse = values => {
  let output

  if (Array.isArray(values)) {
    output = []
    values.map((item, i) => {
      output[i] = hashObjectParse(item)
    })
    return output
  }

  if (isObject(values)) {
    output = {}
    Object.keys(values).map(key => {
      output[key] = hashObjectParse(values[key])
    })
    return output
  }

  if (isString(values)) {
    output = values
    if (Util.isValidDateTime(values)) {
      output = moment(values)
    }
    return output
  }

  return values
}

const HashFilterForm = (props: HashFilterFormProps) => {
  const { onFinish, form, initData } = props
  const currentPageKey = props.currentPageKey ?? 'current'
  const pageSizeKey = props.pageSizeKey ?? 'pageSize'
  const { hash } = useLocation()

  const excludeProps = ['initData', 'currentPageKey', 'pageSizeKey']

  // 从hash query 来渲染初始化数据
  const initialValues = useMemo(() => {
    let values = qs.parse((hash || '?').split('?')[1])

    if (Object.keys(values).length === 0 && initData) {
      values = initData
    }

    // 对特殊数据处理
    return hashObjectParse(values)
  }, [hash, initData])

  // 根据 values 生成新的 hash 地址
  const valuesToHash = values => {
    const newHashStr = qs.stringify(values, { skipNulls: true })

    const r = (hash || '?')
      .split('?')
      .map((s, i) => {
        if (i === 0) return s
        return newHashStr
      })
      .join('?')

    return r === '#?' ? '' : r
  }

  const onSubmit = async () => {
    Emitter.emit('beforeSubmit', initialValues)
    await onFinish!(hashObjectStringify(initialValues))
    Emitter.emit('afterSubmit')
    return true
  }

  const onFinishPreHandler = async values => {
    const hashValues = hashObjectStringify(values)

    // 當前後hash一樣時候為了能觸發提交自刷新一次
    if (valuesToHash(hashValues) === hash) {
      await onSubmit()
    }

    return (location.hash = valuesToHash(hashValues))
  }

  // 捕獲pagination change push到hash
  const onPaginationChange = pagination => {
    // console.log('pagination', pagination)
    // [config]分页当前页字段 根据实际项目修改
    if (currentPageKey !== 'current') {
      pagination[currentPageKey] = pagination.current
      delete pagination.current
    }
    if (pageSizeKey !== 'pageSize') {
      pagination[pageSizeKey] = pagination.pageSize
      delete pagination.pageSize
    }

    onFinishPreHandler({
      ...initialValues,
      ...pagination,
    })
  }

  const onResetForm = () => {
    form?.resetFields()
    location.hash = valuesToHash({})
  }

  useEffect(() => {
    Emitter.on('onReset', onResetForm)
    Emitter.on('onPaginationChange', onPaginationChange)
    onSubmit()
    return () => {
      Emitter.off('onReset', onResetForm)
      Emitter.off('onPaginationChange', onPaginationChange)
    }
  }, [hash])

  const formProps = Util.objectFilter(props, (_, k) => {
    return excludeProps.indexOf(k) === -1
  })

  return (
    <Form
      {...formProps}
      initialValues={initialValues}
      onFinish={onFinishPreHandler}
    />
  )
}

export default HashFilterForm

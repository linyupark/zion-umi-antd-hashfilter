import React, { useEffect, useState } from 'react'
import { Form, Button } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { FormItemProps } from 'antd/lib/form/FormItem'
import { ButtonProps } from 'antd/lib/button'
import Emitter from './emitter'

interface AntFormFilterSubmitProps {
  item?: FormItemProps
  btn?: ButtonProps
}

const AntFormFiltersSubmit: React.FC<AntFormFilterSubmitProps> = props => {
  const { item, btn } = props
  const [loading, setLoading] = useState(false)

  const toggle = v => setLoading(!!v)

  useEffect(() => {
    Emitter.on('beforeSubmit', toggle)
    Emitter.on('afterSubmit', toggle)
    return () => {
      Emitter.off('beforeSubmit', toggle)
      Emitter.off('afterSubmit', toggle)
    }
  }, [])

  return (
    <Form.Item
      colon={false}
      style={{
        margin: '0 0 0 10px',
      }}
      {...item}
    >
      <Button
        type="primary"
        icon={<SearchOutlined />}
        htmlType="submit"
        loading={loading}
        size="large"
        {...btn}
      >
        {props.children}
      </Button>
    </Form.Item>
  )
}

export default AntFormFiltersSubmit

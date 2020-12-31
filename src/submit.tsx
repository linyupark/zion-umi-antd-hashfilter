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

  useEffect(() => {
    Emitter.on('beforeSubmit', () => setLoading(true))
    return () => {
      Emitter.off('afterSubmit', () => setLoading(false))
    }
  }, [])

  return (
    <Form.Item colon={false} {...item}>
      <Button
        type="primary"
        icon={<SearchOutlined />}
        htmlType="submit"
        loading={loading}
        {...btn}
      >
        {props.children}
      </Button>
    </Form.Item>
  )
}

export default AntFormFiltersSubmit

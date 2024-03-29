import { Row, Col, Typography } from 'antd'
import { DownOutlined, UpOutlined } from '@ant-design/icons'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import 'antd/lib/row/style'

const { Link } = Typography

const iconStyles = {
  fontSize: 12,
  margin: ' 0 0 0 10px',
}

interface HashFilterExpandProps {
  children: React.ReactNode
  suffix: JSX.Element
  name: string // 展开名用于session保存状态
  height?: number // 折叠高度
  text?: string // 折叠文案
  suffixWidth?: number
}

const HashFilterExpand = function (props: HashFilterExpandProps) {
  const sess = `expanded_${props.name}`
  const text = props.text ?? 'Expand'
  const suffixWidth = props.suffixWidth ?? 250
  const expandHeight = props.height ?? 50

  const [canExpand, setCanExpand] = useState(false)
  const [expanded, setExpanded] = useState(
    sessionStorage.getItem(sess) === 'true',
  )
  const posRef: any = useRef(null)

  const expandStatus = () =>
    posRef.current?.offsetParent.clientHeight > expandHeight

  useEffect(() => {
    setCanExpand(expandStatus())
  }, [])

  useLayoutEffect(() => {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, 0)
  }, [expanded])

  return (
    <>
      <Row
        style={{ width: '100%' }}
        wrap={false}
        align="top"
        justify="space-between"
      >
        <Col flex="auto">
          <div
            style={{
              height: expanded || !canExpand ? 'auto' : `${expandHeight - 2}px`,
              overflow: 'hidden',
            }}
          >
            {props.children}
            <span ref={posRef}></span>
          </div>
        </Col>
        <Col flex={`${suffixWidth}px`}>
          <Row align={'middle'} justify={'end'}>
            <Col>
              {canExpand && (
                  <Link
                    onClick={() => {
                      sessionStorage.setItem(sess, String(!expanded))
                      setExpanded(!expanded)
                    }}
                  >
                    {text}
                    {expanded ? (
                      <UpOutlined style={iconStyles} />
                    ) : (
                      <DownOutlined style={iconStyles} />
                    )}
                  </Link>
                )}
              {props.suffix}
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  )
}

export default HashFilterExpand

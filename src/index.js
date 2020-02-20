import React, { useContext } from 'react'

export function createContextInspector (ContextType) {
  if (!ContextType) {
    throw new Error('Context type must be provided!')
  }

  let children = null
  const eventHandlers = {
    onFirstRender: [],
    onMount: [],
    onRender: [],
    waitFor: []
  }

  const status = {
    mounted: false,
    rendered: false
  }

  /* The inspector must be a class component to provide
   * compatibility with enzyme that currently cannot read
   * props from functional components */
  class TestInspector extends React.Component {
    constructor (props) {
      super(props)
      this.invokeCallback = this.invokeCallback.bind(this)
    }

    componentDidMount () {
      status.mounted = true
      this.triggerEvent('onMount')
    }

    invokeCallback (callback) {
      return callback.call(this, this.props)
    }

    triggerEvent (eventName) {
      return eventHandlers[eventName].every(this.invokeCallback)
    }

    render () {
      if (!this.triggerEvent('waitFor')) {
        return null
      }
      if (!status.rendered) {
        this.triggerEvent('onFirstRender')
      }
      this.triggerEvent('onRender')
      status.rendered = true
      return children
    }
  }

  function TestComponent () {
    return <TestInspector {...useContext(ContextType)} />
  }

  function provideCallback (name) {
    return function saveCallback (callback) {
      eventHandlers[name].push(callback)
      return TestComponent
    }
  }

  TestComponent.status = status
  TestComponent.Inspector = TestInspector
  TestComponent.onFirstRender = provideCallback('onFirstRender')
  TestComponent.onMount = provideCallback('onMount')
  TestComponent.onRender = provideCallback('onRender')
  TestComponent.waitFor = provideCallback('waitFor')
  TestComponent.setChildren = function (useChildren) {
    children = useChildren
    return TestComponent
  }
  return TestComponent
}

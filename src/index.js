import React, { useContext } from 'react'

function initEventHandlers () {
  return {
    onFirstRender: [],
    onMount: [],
    onRender: [],
    waitFor: []
  }
}

function initStatus () {
  return {
    children: null,
    mounted: false,
    rendered: false
  }
}

/* The inspector must be a class component to provide
 * compatibility with enzyme that currently cannot read
 * props from functional components */
function createInspector (status, eventHandlers) {
  return class TestInspector extends React.Component {
    componentDidMount () {
      status.mounted = true
      this.triggerEvent('onMount')
    }

    invokeCallback = callback => callback.call(this, this.props)
    triggerEvent = eventName => eventHandlers[eventName].every(this.invokeCallback)

    render () {
      if (!this.triggerEvent('waitFor')) {
        return null
      }
      !status.rendered && this.triggerEvent('onFirstRender')
      this.triggerEvent('onRender')
      status.rendered = true
      return status.children
    }
  }
}

function provideCallback (TestComponent, eventHandlers, name) {
  return function saveCallback (callback) {
    eventHandlers[name].push(callback)
    return TestComponent
  }
}

export function createContextInspector (ContextType) {
  if (!ContextType) {
    throw new Error('Context type must be provided!')
  }

  const status = initStatus()
  const eventHandlers = initEventHandlers()
  const TestInspector = createInspector(status, eventHandlers)

  function TestComponent () {
    return <TestInspector {...useContext(ContextType)} />
  }

  TestComponent.status = status
  TestComponent.Inspector = TestInspector
  TestComponent.onFirstRender = provideCallback(TestComponent, eventHandlers, 'onFirstRender')
  TestComponent.onMount = provideCallback(TestComponent, eventHandlers, 'onMount')
  TestComponent.onRender = provideCallback(TestComponent, eventHandlers, 'onRender')
  TestComponent.waitFor = provideCallback(TestComponent, eventHandlers, 'waitFor')
  TestComponent.setChildren = function (useChildren) {
    status.children = useChildren
    return TestComponent
  }
  return TestComponent
}

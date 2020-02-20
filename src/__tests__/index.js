import React, { createContext, useContext } from 'react'

import { createContextInspector } from '..'
import { mount } from 'enzyme'

describe('TestInspector', () => {
  const TestContext = createContext('Test')

  it('throws given context type was not provided', () => {
    expect(() => createContextInspector()).toThrow('Context type must be provided!')
  })

  it('renders', () => {
    const TestComponent = createContextInspector(TestContext)
    expect(() => mount(<TestComponent />)).not.toThrow()
  })

  it('triggers onMount on mount', () => {
    const testFn = jest.fn()
    const TestComponent = createContextInspector(TestContext)
      .onMount(testFn)
    mount(<TestComponent />)
    expect(testFn).toHaveBeenCalled()
  })

  it('provides context props to onMount', () => {
    const testFn = jest.fn()
    const TestComponent = createContextInspector(TestContext)
      .onMount(testFn)
    mount(
      <TestContext.Provider value={{ test: 'foo' }}>
        <TestComponent />
      </TestContext.Provider>
    )
    expect(testFn).toHaveBeenCalledWith({ test: 'foo' })
  })

  it('triggers onRender on render', () => {
    const testFn = jest.fn()
    const TestComponent = createContextInspector(TestContext)
      .onRender(testFn)
    mount(<TestComponent />)
    expect(testFn).toHaveBeenCalled()
  })

  it('provides context props to onRender', () => {
    const testFn = jest.fn()
    const TestComponent = createContextInspector(TestContext)
      .onRender(testFn)
    mount(
      <TestContext.Provider value={{ test: 'foo' }}>
        <TestComponent />
      </TestContext.Provider>
    )
    expect(testFn).toHaveBeenCalledWith({ test: 'foo' })
  })

  it('triggers onRender on each render', () => {
    const testFn = jest.fn()
    const TestComponent = createContextInspector(TestContext)
      .onRender(testFn)
    const comp = mount(<TestComponent />)
    comp.setProps({})
    comp.setProps({})
    expect(testFn).toHaveBeenCalledTimes(3)
  })

  it('triggers onFirstRender only once', () => {
    const testFn = jest.fn()
    const TestComponent = createContextInspector(TestContext)
      .onFirstRender(testFn)
    const comp = mount(<TestComponent />)
    comp.setProps({})
    comp.setProps({})
    expect(testFn).toHaveBeenCalledTimes(1)
  })

  it('renders children', () => {
    function TestChild () {
      return null
    }
    const TestComponent = createContextInspector(TestContext)
      .setChildren(<TestChild />)
    const comp = mount(<TestComponent />)
    expect(comp.find(TestChild)).toHaveLength(1)
  })

  it('does not trigger onRender until "wait for" conditions are not met', () => {
    const testFn = jest.fn()
    const TestComponent = createContextInspector(TestContext)
      .waitFor(({ test }) => test === 'bar')
      .onRender(testFn)
    function Wrapper ({ test }) {
      return (
        <TestContext.Provider value={{ test }}>
          <TestComponent />
        </TestContext.Provider>
      )
    }
    const comp = mount(<Wrapper test='foo' />)
    expect(testFn).toHaveBeenCalledTimes(0)
    comp.setProps({ test: 'bar' })
    expect(testFn).toHaveBeenCalledTimes(1)
  })

  it('does not trigger onFirstRender until "wait for" conditions are not met', () => {
    const testFn = jest.fn()
    const TestComponent = createContextInspector(TestContext)
      .waitFor(({ test }) => test === 'bar')
      .onFirstRender(testFn)
    function Wrapper ({ test }) {
      return (
        <TestContext.Provider value={{ test }}>
          <TestComponent />
        </TestContext.Provider>
      )
    }
    const comp = mount(<Wrapper test='foo' />)
    expect(testFn).toHaveBeenCalledTimes(0)
    comp.setProps({ test: 'bar' })
    expect(testFn).toHaveBeenCalledTimes(1)
  })

  it('does not render children until "wait for" conditions are not met', () => {
    function TestChild () {
      return null
    }
    const TestComponent = createContextInspector(TestContext)
      .waitFor(({ test }) => test === 'bar')
      .setChildren(<TestChild />)
    function Wrapper ({ test }) {
      return (
        <TestContext.Provider value={{ test }}>
          <TestComponent />
        </TestContext.Provider>
      )
    }
    const comp = mount(<Wrapper test='foo' />)
    expect(comp.find(TestChild)).toHaveLength(0)
    comp.setProps({ test: 'bar' })
    expect(comp.find(TestChild)).toHaveLength(1)
  })

  it('runs example test', async () => {
    const UserContext = createContext('User')
    function UserDetail () {
      const { name } = useContext(UserContext)
      return <div>{name}</div>
    }
    const TestComponent = createContextInspector(UserContext)
      .setChildren(<UserDetail />)
      .waitFor(({ name }) => name === 'Qui-Gon Jinn')
      .onMount(({ load }) => setTimeout(() => load('Qui-Gon Jinn')))
      .onFirstRender(({ afterLoad, name }) => afterLoad(name))
    const load = jest.fn()
    const afterLoad = jest.fn()
    function TestWrapper ({ name }) {
      return (
        <UserContext.Provider value={{ afterLoad, load, name }}>
          <TestComponent />
        </UserContext.Provider>
      )
    }
    const comp = mount(<TestWrapper name='Obi-Wan Kenobi' />)
    load.mockImplementation((name) => comp.setProps({ name }))
    // We need to wait because the test is entangled
    await new Promise(resolve => setTimeout(resolve))
    expect(load).toHaveBeenCalledWith('Qui-Gon Jinn')
    expect(afterLoad).toHaveBeenCalledWith('Qui-Gon Jinn')
    expect(comp.find(TestComponent.Inspector).props())
      .toHaveProperty('name', 'Qui-Gon Jinn')
  })
})

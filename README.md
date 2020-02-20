# react-context-inspector

Tiny tool that helps you when testing your context in complex test scenarios. Compatible with react and react-native. Very helpful with Enzyme.js.

## Install

```shell
npm install --save-dev react-context-inspector
```

## API reference

### createContextInspector

Returns TestComponent, that has chainable methods

```
import { createContextInspector } from 'react-context-inspector'
createContextInspector(YourContext)
```

### .onMount

Trigger event on mount


```
import { createContextInspector } from 'react-context-inspector'
const TestComponent = createContextInspector(YourContext)
  .onMount(props => props.load('foo'))
```

### .onRender

Trigger event on every render


```
import { createContextInspector } from 'react-context-inspector'
const TestComponent = createContextInspector(YourContext)
  .onRender(props => props.load('foo'))
```

### .onFirstRender

Trigger event on first render


```
import { createContextInspector } from 'react-context-inspector'
const TestComponent = createContextInspector(YourContext)
  .onFirstRender(props => props.load('foo'))
```

### .waitFor

Prevents from rendering children and triggering onRender and onFirst render. Very useful when testing asynchronous states


```
import { createContextInspector } from 'react-context-inspector'
const TestComponent = createContextInspector(YourContext)
  .waitFor(props => props.initialized)
```

### .setChildren

Use this when you need to protect the tested content from rendering before somethigng happens. Usually combined with .waitFor


```
import { createContextInspector } from 'react-context-inspector'
const TestComponent = createContextInspector(YourContext)
  .setChildren(<MyComponent />)
  .waitFor(props => props.initialized)
```

## Example usage

This example basically covers everything.

```javascript
import React, {createContext} from 'react'
import { createContextInspector } from 'react-context-inspector'


describe('Test component', () => {
  it('provides user name', () => {
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
```

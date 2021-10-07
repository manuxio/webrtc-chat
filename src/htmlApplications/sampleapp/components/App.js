import React, { Component, Suspense } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { addTodo } from '../actions/todo';
import { ping } from '../actions/ping';
import {
  PING_SUCCESS,
  PING_STARTED
} from '../actiontypes/ping';

import '../styles/App.css';

const mapStateToProps = (state) => {
  return {
    todo: state.todo,
    ping: state.ping
  }
};

const mapDispatchToProps = dispatch => {
  return {
    onAddTodo: todo => {
      dispatch(addTodo(todo));
    },
    doPing: () => {
      dispatch(ping());
    }
  };
};

class LegacyComponent extends Component {
  render() {
    const { t } = this.props;
    return (
      <div id="App">
        <div>{t('title')}</div>
        <div>{t('todolist')}:</div>
        {
          this.props.todo.loading
          ? <span>Adding tasks...</span>
          : null
        }
        <ul>
        {
          this.props.todo.todos.map((todo) => (
              <li key={todo.id}>{todo.title}</li>
            )
          )
        }
        </ul>
        <button onClick={() => {
          this.props.onAddTodo({
            userid: 1,
            title: 'My next todo'
          })
        }}>Click me!</button>
        <div />
        <button onClick={() => {
            this.props.doPing()
          }}>{
            this.props.ping?.type === PING_SUCCESS ? 'Ping OK!' : (this.props.ping?.type === PING_STARTED ? 'Pinging...' : 'Ping Electron')
          }</button>
      </div>
    );
  }
}

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(withTranslation('sampleapp')(LegacyComponent));
export default function App() {
  return (
    <Suspense fallback="loading">
      <MyComponent />
    </Suspense>
  );
}


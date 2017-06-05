/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from 'react-native';
import {
  Board as SudokuBoard,
  range
} from './lib/sudoku';

class BoardCell extends Component {
  constructor(props) {
    super(props);
    this.colors = ['#CC9194', '#F7A5A7', '#F8C0C0', '#89B2BB', '#6C9299'];
  }

  colorize(row/*: number*/, col/*: number*/)/*: string*/ {
    if (row % 2 === 0) {
      return col % 2 === 0 ? this.colors[0] : this.colors[1];
    } else {
      return col % 2 === 0 ? this.colors[1] : this.colors[0];
    }
  }

  stylize(row, col) {
    return {
      flex: 1,
      backgroundColor: this.colorize(this.props.row, this.props.col),
      justifyContent: 'center',
      alignItems: 'center'
    };
  }

  onPress() {
    //throw new Error('xxx');
  }

  render() {
    return (
      <TouchableHighlight key={this.props.col}
                          onPress={this.onPress}
                          underlayColor="#cccccc"
                          style={this.stylize()}>
        <Text style={{textAlign: 'center', fontWeight: 'bold'}}>{this.props.row}, {this.props.col}</Text>
      </TouchableHighlight>
    );
  }
}

class BoardRow extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const key = `${this.props.row}-${col}`;
    return (
      <View style={{flex: 1, flexDirection: 'row'}}>
        {range(1, 10).map(col => <BoardCell key={key} row={this.props.row} col={col} />)}
      </View>
    )
  }
}

class Board extends Component {
  constructor(props) {
    super(props);
    this.state = this.board;
  }

  render() {
    return (
      <View style={{flex: 1, paddingVertical: 75, paddingHorizontal: 25 }}>
        {range(1, 10).map(row => <BoardRow key={row} row={row} />)}
      </View>
    );
  }
}

export default class Sudoku extends Component {
  constructor(props) {
    super(props);
    this.state = SudokuBoard.create(3, 3);
  }

  render() {
    return (
      <View style={{flex: 1, flexDirection: 'column' }}>
        <Board board={this.state}/>
      </View>
    );
  }
}

AppRegistry.registerComponent('sudoku', () => Sudoku);
AppRegistry.registerComponent('BoardCell', () => BoardCell);
AppRegistry.registerComponent('BoardRow', () => BoardRow);
AppRegistry.registerComponent('Board', () => Board);

import React, { Component, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Button
} from 'react-native';
import SearchInput, { createFilter } from 'react-native-elements'
import axios from 'axios';

let baseURL = ''

let cancel = ''

if (process.env.NODE_ENV === 'development') {
  baseURL = 'http://localhost:3003'
} else {
  baseURL = 'https://secure-hollows-11303.herokuapp.com'
}

const behaviorsURL = 'http://localhost:3003/behaviors/'
const behaviorsFind = 'http://localhost:3003/behaviors/find/'

const KEYS_TO_FILTERS = ['title', 'definition'];

class App extends Component {

  state = {
    query: '',
    results: {},
    loading: false,
    message: '',
    behaviors: [],
    searchTerm: '',
    isHidden: false,
    content: true,
  }

  componentDidMount() {
    this.getBehaviors();
  }


  getBehaviors = () => {
    axios.get(behaviorsURL).then(res => {
      console.log(res.data)
      this.setState({ behaviors: res.data })
    }).catch((error) => {
      console.log("Api call error");
      alert(error.message);
    });
  }


  hideAndShow = () => {
    this.setState(previousState => ({ content: !previousState.content }))
  }


  handleOnInputChange = (event) => {
    const query = event.target.value;
    if (!query) {
      this.setState({ query, results: {}, message: '' })
    } else {
      this.setState({ query, loading: true, message: '' },
        () => {
          this.getSearchResults(1, query);
        })
    }
  }

  getSearchResults = (updatedPageNo = '', query) => {
    const pageNumber = updatedPageNo ? `${updatedPageNo}` : '';
    const searchURL = `${behaviorsFind}${query}`;

    if (this.cancel) {
      this.cancel.cancel();
    }
    this.cancel = axios.CancelToken.source();

    axios
      .get(searchURL, {
        cancelToken: this.cancel.token,
      })
      .then((res) => {
        const resultNotFoundMsg = !res.data.length ? 'There are no matching search results. Please try again.' : '';
        this.setState({
          results: res.data.map(function (item, i) {
            return (
              item
            )
          }),
          message: resultNotFoundMsg,
          loading: false,
        })
      }).catch((error) => {
        if (axios.isCancel(error) || error) {
          this.setState({
            loading: false,
            message: 'Failed to fetch results. Please check network.'
          })
        }
      })
  }

  renderSearchReults = () => {
    const { results } = this.state;

    if (Object.keys(results).length && results.length) {
      return (
        <View>
          {results.map((result) => {
            return (
              <View style={styles.results} key={result.id}>
                <Text style={styles.title}>
                  {result.title}
                </Text>
                <br />
                <Text style={styles.words}>
                  {'Definition:'}
                </Text>
                {' '}
                {result.definition}
                <br />
                <Text style={styles.words}>
                  {'Methods:'}
                </Text>
                {' '}
                {result.methods}
                <br />
                <Text style={styles.words}>
                  {'Resources:'}
                </Text>
                {' '}
                {result.resources}
              </View>
            )
          })}
        </View>
      )
    }
  }

  render() {

    return (

      <View style={styles.container}>

        <SafeAreaView />

        <Text style={styles.header}>BehaviorBuddy</Text>

        <Text style={styles.searchText}>The App that puts the ABA world into your pocket! What should we learn about today?</Text>

        <TextInput
          style={styles.input}
          type='text'
          value={this.state.query}
          id='search-input'
          placeholder='enter keyword(s)'
          onChange={this.handleOnInputChange}
        />

        <Text style={styles.searchText}>Search results will appear below:</Text>

        <Text>
          {this.renderSearchReults()}
        </Text>

        <Text style={styles.searchText}>------Search results will appear above------</Text>
        <Text style={styles.searchText}>--OR scroll through our full database below--</Text>

        <Text style={styles.header1}>Full BehaviorBuddy Database:</Text>

        <FlatList
          data={this.state.behaviors && this.state.behaviors.length > 0 ? this.state.behaviors : this.state.data}
          keyExtractor={(item) => `item-${item.title}`}
          renderItem={({ item }) => (
            <Text style={styles.indexCards}>
              <Text style={styles.title}>
                {item.title}
              </Text>
              <br />
              { !this.state.content ?
                <Text>
                  <Text style={styles.words}>
                    {'Definition:'}
                  </Text>
                  <Text>
                    {' '}
                    {item.definition}
                    <br />
                  </Text>
                  <Text style={styles.words}>
                    {'Methods:'}
                  </Text>
                  <Text>
                    {' '}
                    {item.methods}
                    <br />
                  </Text>
                  <Text style={styles.words}>
                    {'Resources:'}
                  </Text>
                  <Text>
                    {' '}
                    {item.resources}
                    <br />
                  </Text>
                </Text>
                : this.state.content }
              <br />
              <Button title="Show Info" onPress={this.hideAndShow} />
            </Text>

          )}
        />

        <StatusBar style="auto" />
      </View >
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DBF3FA',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'San Francisco',
  },
  header: {
    fontWeight: 'bold',
    fontSize: 36,
    marginTop: 100,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 2,
  },
  indexCards: {
    backgroundColor: '#fff',
    borderRadius: 2,
    borderColor: 'black',
    borderWidth: 1,
    borderStyle: ('solid'),
    padding: 40,
    margin: 16,
    textAlign: 'center',
    width: 300,

  },
  buttonContainer: {
    padding: 8,
    margin: 16,
    textAlign: 'center',
  },
  searchText: {
    padding: 8,
    margin: 20,
    fontStyle: 'italic',
    maxWidth: 375,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 2,
    borderColor: 'black',
    borderWidth: 1,
    borderStyle: ('solid'),
    height: 34,
    width: 200,
    paddingLeft: 8,
  },
  loadingBar: {
    flex: 1,
    padding: 25,
  },
  listText: {
    color: 'black'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  words: {
    textDecorationLine: 'underline',
  },
  results: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
    borderColor: 'black',
    borderWidth: 1,
    borderStyle: ('solid'),
    padding: 40,
    margin: 16,
    textAlign: 'center',
    width: 300,
  },
  header1: {
    fontWeight: 'bold',
    fontSize: 24,
    marginTop: 20,
    marginBottom: 10,
  }
});

export default App;
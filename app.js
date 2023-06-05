import React, { useState, useEffect } from 'react';
import { View, TextInput, Dimensions, StyleSheet, FlatList, Text, TouchableOpacity, Linking } from 'react-native';

const SearchBar = ({ onSearch }) => {
  const [searchText, setSearchText] = useState('');
  const [searchBarWidth, setSearchBarWidth] = useState(Dimensions.get('window').width * 0.8);
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/2/search?search_terms=${searchText}`);
      const data = await response.json();
      setSearchResults(data.products);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const handleKeyPress = event => {
    if (event.nativeEvent.key === 'Enter') {
      handleSearch();
    }
  };

  useEffect(() => {
    const updateSearchBarWidth = () => {
      setSearchBarWidth(Dimensions.get('window').width * 0.8);
    };

    Dimensions.addEventListener('change', updateSearchBarWidth);

    return () => {
      Dimensions.removeEventListener('change', updateSearchBarWidth);
    };
  }, []);

  useEffect(() => {
    if (searchText === '') {
      setSearchResults([]);
    }
  }, [searchText]);

  const handleResultPress = url => {
    Linking.openURL(url); // Open the URL in a browser or a new tab
  };

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity onPress={() => handleResultPress(item.url)}>
      <Text>{item.product_name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.searchBar,
          { width: searchBarWidth } // Responsive width
        ]}
        onChangeText={text => setSearchText(text)}
        value={searchText}
        placeholder="Search by name or ingredients"
        onKeyPress={handleKeyPress}
      />
      <FlatList
        data={searchResults}
        renderItem={renderSearchResult}
        keyExtractor={item => item.code}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 50
  },
  searchBar: {
    height: 40,
    borderColor: '#E8E8E8',
    borderWidth: 1,
    marginBottom: 10,
    borderRadius: 100,
    paddingHorizontal: 10,
    backgroundColor: '#F6F6F6',
    color: 'black',
    placeholderTextColor: '#BDBDBD'
  }
});

export default SearchBar;

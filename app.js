import React, { useState, useEffect } from 'react';
import { View, TextInput, Dimensions, StyleSheet, FlatList, Text, TouchableOpacity, Linking } from 'react-native';

const SearchBar = ({ onSearch }) => {
  const [searchText, setSearchText] = useState('');
  const [searchBarWidth, setSearchBarWidth] = useState(Dimensions.get('window').width * 0.8);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [pairings, setPairings] = useState([]);

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

  const handleClearSearch = () => {
    setSearchText('');
    setSearchResults([]);
    setSelectedResult(null);
    setPairings([]);
    window.location.reload(); // Refresh the page
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

  const handleResultPress = async result => {
    setSelectedResult(result);
    Linking.openURL(result.url);

    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${result.code}.json`);
      const data = await response.json();
      const extractedPairings = data.product.ingredients_analysis_tags.map(pairing => pairing.replace(/^en:/, ''));
      setPairings(extractedPairings);
    } catch (error) {
      console.error('Error fetching pairings:', error);
    }
  };

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity onPress={() => handleResultPress(item)}>
      <Text>{item.product_name}</Text>
    </TouchableOpacity>
  );

  const renderPairingItem = ({ item }) => (
    <Text>{item}</Text>
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
      {selectedResult && (
        <View>
          <Text>Selected Result: {selectedResult.product_name}</Text>
          {pairings.length > 0 && (
            <View>
              <Text>Pairings:</Text>
              <FlatList
                data={pairings}
                renderItem={renderPairingItem}
                keyExtractor={(item, index) => index.toString()}
              />
            </View>
          )}
        </View>
      )}
      <TouchableOpacity onPress={handleClearSearch}>
        <Text>Clear Search</Text>
      </TouchableOpacity>
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

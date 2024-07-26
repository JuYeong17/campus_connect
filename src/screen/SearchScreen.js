import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const navigation = useNavigation();
  const route = useRoute();
  const { setSearchQuery } = route.params;  // Use setSearchQuery passed from JobBoardScreen

  const handleSearch = () => {
    if (setSearchQuery) {
      setSearchQuery(query);  // Pass query back to JobBoardScreen
    }
    navigation.goBack();  // Return to previous screen
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="검색어를 입력하세요"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          placeholderTextColor="#888"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>검색</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',  // Light background color
  },
  header: {
    paddingVertical: 30,  // Reduced top and bottom padding
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',  // White background for the header
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',  // Light border color
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#fff',  // White background for the input
    borderColor: '#ddd',  // Light border color
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchButton: {
    marginLeft: 10,
    backgroundColor: '#2c3e50',  // Primary button color
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SearchScreen;

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { Provider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';

const formatRelativeTime = (time) => {
  const postTime = moment(time);
  return moment().diff(postTime, 'days') >= 1 ? postTime.format('YYYY-MM-DD') : postTime.fromNow();
};

const LikeManagementScreen = () => {
  const [likedItems, setLikedItems] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    // Fetch liked items from an API or database
    const fetchLikedItems = async () => {
      // Mock data for demonstration
      const data = [
        { id: '1', title: '취업 준비 다들 어떻게 하셨나요???', content: '막막합니다ㅜㅜ', time: '2024-07-22T10:00:00Z', likes: 5, type: 'post' },
      ];
      setLikedItems(data);
    };

    fetchLikedItems();
  }, []);

  const handleUnlikeItem = (itemId) => {
    Alert.alert('좋아요 취소', '정말로 이 항목의 좋아요를 취소하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '확인',
        onPress: () => {
          setLikedItems(likedItems.filter(item => item.id !== itemId));
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <TouchableOpacity onPress={() => handleUnlikeItem(item.id)} style={styles.unlikeButton}>
          <Ionicons name="heart-dislike" size={20} color="red" />
        </TouchableOpacity>
      </View>
      <Text style={styles.itemContent}>{item.content}</Text>
      <Text style={styles.itemTime}>{formatRelativeTime(item.time)}</Text>
      <Text style={styles.itemLikes}>Likes: {item.likes}</Text>
    </View>
  );

  return (
    <Provider>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={30} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>좋아요 관리</Text>
        </View>
        <FlatList
          data={likedItems}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    backgroundColor: '#2c3e50',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    position: 'absolute',
    left: 16,
    top: 45,
    zIndex : 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 0,
    paddingVertical: 8,
  },
  itemContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 5,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  unlikeButton: {
    padding: 5,
  },
  itemContent: {
    fontSize: 14,
    marginVertical: 4,
  },
  itemTime: {
    fontSize: 12,
    color: '#bdc3c7',
  },
  itemLikes: {
    fontSize: 12,
    color: '#7f8c8d',
  },
});

export default LikeManagementScreen;

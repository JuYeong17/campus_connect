import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Provider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { getStoredUserInfo } from '../api'; // Import getStoredUserInfo to fetch user info
import moment from 'moment';

// Function to format the time to be shown in UI
const formatRelativeTime = (time) => {
  const postTime = moment(time);
  return moment().diff(postTime, 'days') >= 1 ? postTime.format('YYYY-MM-DD') : postTime.fromNow();
};

const LikeManagementScreen = () => {
  // UseState for handling liked items
  const [likedItems, setLikedItems] = useState([]);
  // UseState for showing ActivityIndicator while loading
  const [loading, setLoading] = useState(true);
  // UseState for storing user information
  const [userInfo, setUserInfo] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchLikedItems = async () => {
      try {
        // Fetch stored user info
        const storedUserInfo = await getStoredUserInfo();

        if (storedUserInfo && storedUserInfo.user) {
          const userId = storedUserInfo.user.id; // Fetch user_id from user info
          setUserInfo(storedUserInfo.user); // Store userInfo in state

          console.log('Fetching liked items for user_id:', userId); // Debug log

          // Fetch liked items for this user
          const response = await axios.get(
            `http://13.125.20.36:3000/api/likes/user/${userId}`
          );

          setLikedItems(response.data);
        } else {
          Alert.alert('오류', '로그인 정보가 없습니다.');
        }
      } catch (error) {
        console.error('Error fetching liked items:', error);
        Alert.alert('오류', '좋아요 항목을 가져오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
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
        onPress: async () => {
          try {
            if (!userInfo) {
              // Check if userInfo exists before proceeding
              Alert.alert('오류', '사용자 정보가 없습니다.');
              return;
            }

            // Post request to toggle the like
            await axios.post('http://13.125.20.36:3000/api/likes/toggle', {
              question_id: itemId,
              user_id: userInfo.id, // Use userInfo.id here
              liked: true,
            });

            setLikedItems(likedItems.filter((item) => item.id !== itemId));
            Alert.alert('좋아요 취소됨', '좋아요가 취소되었습니다.');
          } catch (error) {
            console.error('Error unliking item:', error);
            Alert.alert('오류', '좋아요 취소 중 오류가 발생했습니다.');
          }
        },
      },
    ]);
  };

  // Rendering each item of the flat list
  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <TouchableOpacity
          onPress={() => handleUnlikeItem(item.id)}
          style={styles.unlikeButton}
        >
          <Ionicons name="heart-dislike" size={20} color="red" />
        </TouchableOpacity>
      </View>
      <Text style={styles.itemContent}>{item.content}</Text>
      <Text style={styles.itemTime}>{formatRelativeTime(item.liked_at)}</Text>
      <Text style={styles.itemLikes}>Likes: {item.likes}</Text>
    </View>
  );

  return (
    <Provider>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backIcon}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={30} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>좋아요 관리</Text>
        </View>
        {loading ? ( // Show loading indicator while fetching data
          <ActivityIndicator size="large" color="#2c3e50" />
        ) : (
          <FlatList
            data={likedItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
          />
        )}
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
    zIndex: 1,
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

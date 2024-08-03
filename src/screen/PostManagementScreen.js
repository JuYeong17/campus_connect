import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { getStoredUserInfo } from '../api'; // Import function to get stored user info

const PostManagementScreen = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true); // Add a loading state for better UX
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Get stored user info
        const storedUserInfo = await getStoredUserInfo();

        if (storedUserInfo && storedUserInfo.user) {
          const userId = storedUserInfo.user.id; // Fetch user_id from user info

          console.log('Fetching posts for user_id:', userId); // Log for debugging

          // Fetch posts for this user
          const response = await axios.get(
            `http://13.125.20.36:3000/api/questions/user/${userId}`
          );

          setPosts(response.data);
        } else {
          Alert.alert('오류', '로그인 정보가 없습니다.');
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        Alert.alert('오류', '게시글을 가져오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };

    fetchPosts();
  }, []);

  const handleDeletePost = (postId) => {
    Alert.alert(
      '삭제 확인',
      '정말로 이 게시글을 삭제하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          onPress: async () => {
            try {
              await axios.delete(
                `http://13.125.20.36:3000/api/questions/${postId}`
              );

              // Remove post from state after deletion
              const updatedPosts = posts.filter((post) => post.id !== postId);
              setPosts(updatedPosts);

              Alert.alert('삭제 완료', '게시글이 삭제되었습니다.');
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert('오류', '게시글 삭제에 실패했습니다.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.postContainer}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.content}>{item.content}</Text>
      <View style={styles.row}>
        <Ionicons name="person-circle" size={18} color="#2c3e50" />
        <Text style={styles.username}>{item.username}</Text>
      </View>
      <TouchableOpacity
        onPress={() => handleDeletePost(item.id)}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteButtonText}>삭제</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={30} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>게시글 관리</Text>
        </View>
      </View>
      {loading ? ( // Show loading indicator while data is being fetched
        <ActivityIndicator size="large" color="#2c3e50" />
      ) : (
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('WritePostScreen')}
      >
        <Ionicons name="pencil" size={24} color="white" />
      </TouchableOpacity>
    </View>
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
    justifyContent: 'space-between',
  },
  backIcon: {
    position: 'absolute',
    left: 16,
    top: 45,
  },
  headerTextContainer: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 0,
    paddingVertical: 8,
  },
  postContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    fontSize: 14,
    marginVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  username: {
    fontSize: 12,
    color: '#888',
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#2c3e50',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
});

export default PostManagementScreen;

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { Provider } from 'react-native-paper';
import moment from 'moment';
import 'moment/locale/ko'; // Import Korean locale
import { useNavigation, useRoute } from '@react-navigation/native';
import { getPosts, addPost, toggleLike, toggleScrap } from '../api'; // Import API functions

const JobBoardScreen = () => {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);
  const navigation = useNavigation();
  const route = useRoute();
  const { userInfo } = route.params;

  useEffect(() => {
    moment.locale('ko');
    fetchPosts();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setFilteredPosts(posts.filter(post =>
        post.title.includes(searchQuery) || post.content.includes(searchQuery)
      ));
    } else {
      setFilteredPosts(posts);
    }
  }, [searchQuery, posts]);

  const fetchPosts = async () => {
    try {
      const response = await getPosts();
      setPosts(response);
      setFilteredPosts(response);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleAddPost = async (newPost) => {
    try {
      const response = await addPost(newPost);
      setPosts([response, ...posts]);
      setFilteredPosts([response, ...posts]);
    } catch (error) {
      console.error('Error adding post:', error);
    }
  };

  const handleToggleLike = async (id, liked) => {
    try {
      await toggleLike(id, liked);
      const updatedPosts = posts.map(post =>
        post.id === id ? { ...post, likes: post.likes + (liked ? -1 : 1), liked: !post.liked } : post
      );
      setPosts(updatedPosts);
      setFilteredPosts(updatedPosts);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleToggleScrap = async (id, scrapped) => {
    try {
      await toggleScrap(id, scrapped);
      const updatedPosts = posts.map(post =>
        post.id === id ? { ...post, scrapped: !post.scrapped } : post
      );
      setPosts(updatedPosts);
      setFilteredPosts(updatedPosts);
    } catch (error) {
      console.error('Error toggling scrap:', error);
    }
  };

  const formatRelativeTime = (time) => {
    const postTime = moment(time);
    return moment().diff(postTime, 'days') >= 1 ? postTime.format('YYYY-MM-DD') : postTime.fromNow();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.postContainer} onPress={() => navigation.navigate('PostDetailScreen', { post: item, userInfo })}>
      <Text style={styles.title}>Q. {item.title}</Text>
      <Text style={styles.content}>{item.content}</Text>
      <View style={styles.row}>
        <Ionicons name="person-circle" size={18} color="#2c3e50" />
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.time}>{formatRelativeTime(item.time)}</Text>
      </View>
      <View style={styles.separator} />
      <View style={styles.interactions}>
        <TouchableOpacity onPress={() => handleToggleLike(item.id, item.liked)} style={styles.iconWithText}>
          <FontAwesome name={item.liked ? "heart" : "heart-o"} size={14} color="black" />
          <Text style={styles.interactionText}>공감 {item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleToggleScrap(item.id, item.scrapped)} style={styles.iconWithText}>
          <FontAwesome name={item.scrapped ? "bookmark" : "bookmark-o"} size={14} color="black" />
          <Text style={styles.interactionText}>스크랩</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <Provider>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={30} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>취업게시판</Text>
            <Text style={styles.headerSubtitle}>{userInfo.selectedUniversity}</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.searchIcon}
              onPress={() => navigation.navigate('Search', { setSearchQuery })}
            >
              <Ionicons name="search" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('MyPage', { userInfo })}>
              <Ionicons name="person" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        <FlatList
          data={filteredPosts}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
        <TouchableOpacity style={styles.writeButton} onPress={() => navigation.navigate('WritePostScreen', { addPost: handleAddPost, userInfo })}>
          <Ionicons name="pencil" size={24} color="white" />
        </TouchableOpacity>
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
    paddingBottom: 10,
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
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#ffffff',
    marginBottom: 5,
  },
  headerIcons: {
    flexDirection: 'row',
    position: 'absolute',
    right: 16,
    top: 45,
  },
  searchIcon: {
    marginRight: 10,
  },
  listContainer: {
    paddingHorizontal: 0,
    paddingVertical: 8,
  },
  postContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginVertical: 8,
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
    justifyContent: 'flex-start',
  },
  time: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
  },
  username: {
    fontSize: 12,
    color: '#888',
    marginRight: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 8,
  },
  interactions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  interactionText: {
    marginLeft: 4,
    marginRight: 8,
  },
  iconWithText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  writeButton: {
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

export default JobBoardScreen;
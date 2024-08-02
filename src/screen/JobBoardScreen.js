import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { Provider } from 'react-native-paper';
import moment from 'moment';
import 'moment/locale/ko';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { getQuestionsByCategory, toggleLike, toggleScrap, getStoredUserInfo } from '../api';

const JobBoardScreen = () => {
  const [questions, setQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const navigation = useNavigation();
  const [userInfo, setUserInfo] = useState(null);
  const route = useRoute();
  const { selectedUniversity } = route.params;

  const fetchQuestions = async () => {
    try {
      const response = await getQuestionsByCategory(1); // Fetch questions for category ID 1
      console.log('Fetched questions:', response);

      // Sort questions by id in descending order by default
      const sortedQuestions = response.sort((a, b) => b.id - a.id);

      setQuestions(sortedQuestions);
      setFilteredQuestions(sortedQuestions);
      console.log(selectedUniversity);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  // Fetch data when the screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          await fetchQuestions();
          const response = await getStoredUserInfo();
          console.log('Fetched user info:', response); // Full response for debugging

          // Check if response is not null and has a user property
          if (response && response.user) {
            setUserInfo(response.user); // Extract user object
          } else {
            setUserInfo(null); // Set userInfo to null if response is invalid
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
          setUserInfo(null); // Ensure userInfo is set to null on error
        }
      };
      fetchData();
    }, []),
  );

  useEffect(() => {
    console.log('Updated userInfo:', userInfo);
  }, [userInfo]);

  useEffect(() => {
    if (searchQuery) {
      setFilteredQuestions(questions.filter(question =>
        question.title.includes(searchQuery) || question.content.includes(searchQuery)
      ));
    } else {
      setFilteredQuestions(questions);
    }
  }, [searchQuery, questions]);

  const handleToggleLike = async (id, liked) => {
    try {
      await toggleLike(id, liked);
      const updatedQuestions = questions.map(question =>
        question.id === id ? { ...question, likes: question.likes + (liked ? -1 : 1), liked: !question.liked } : question
      );
      setQuestions(updatedQuestions);
      setFilteredQuestions(updatedQuestions);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleToggleScrap = async (id, scrapped) => {
    try {
      await toggleScrap(id, scrapped);
      const updatedQuestions = questions.map(question =>
        question.id === id ? { ...question, scrapped: !question.scrapped } : question
      );
      setQuestions(updatedQuestions);
      setFilteredQuestions(updatedQuestions);
    } catch (error) {
      console.error('Error toggling scrap:', error);
    }
  };

  const handleAddPost = (newPost) => {
    if (!newPost.id) {
      console.error('New post is missing an id:', newPost);
      return; // Exit if the new post doesn't have an ID
    }
    const updatedQuestions = [newPost, ...questions];
    setQuestions(updatedQuestions);
    setFilteredQuestions(updatedQuestions);
  };

  const formatRelativeTime = (time) => {
    const questionTime = moment(time);
    return moment().diff(questionTime, 'days') >= 1
      ? questionTime.format('YYYY-MM-DD')
      : questionTime.fromNow();
  };

  const handleWritePost = () => {
    if (!userInfo) {
      Alert.alert(
        '로그인 필요',
        '로그인해야 글을 작성할 수 있습니다.',
        [
          { text: '취소', style: 'cancel' },
          { text: '로그인', onPress: () => navigation.navigate('Login') },
        ],
        { cancelable: false }
      );
      return;
    }

    navigation.navigate('WritePostScreen', {
      category_id: 1,
      onAddPost: handleAddPost, // Pass the callback
    });
  };

  const handleNavigateToMyPage = () => {
    if (!userInfo) {
      Alert.alert(
        '로그인 필요',
        '로그인해야 마이페이지를 볼 수 있습니다.',
        [
          { text: '취소', style: 'cancel' },
          { text: '로그인', onPress: () => navigation.navigate('Login') },
        ],
        { cancelable: false }
      );
      return;
    }

    navigation.navigate('MyPage', { userInfo });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.postContainer}
      onPress={() =>
        navigation.navigate('PostDetailScreen', { post: item, userInfo })
      }
    >
      <View style={styles.postContent}>
        <View style={styles.postTextContainer}>
          <Text style={styles.title}>Q. {item.title}</Text>
          <Text style={styles.content}>{item.content}</Text>
          <View style={styles.row}>
            <Ionicons name="person-circle" size={18} color="#2c3e50" />
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.time}>{formatRelativeTime(item.created_at)}</Text>
          </View>
        </View>
        {item.image_url && (
          <Image
            source={{ uri: item.image_url }}
            style={styles.postImage}
            resizeMode="cover"
          />
        )}
      </View>
      <View style={styles.separator} />
      <View style={styles.interactions}>
        <TouchableOpacity
          onPress={() => handleToggleLike(item.id, item.liked)}
          style={styles.iconWithText}
        >
          <FontAwesome
            name={item.liked ? 'heart' : 'heart-o'}
            size={14}
            color="black"
          />
          <Text style={styles.interactionText}>공감 {item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleToggleScrap(item.id, item.scrapped)}
          style={styles.iconWithText}
        >
          <FontAwesome
            name={item.scrapped ? 'bookmark' : 'bookmark-o'}
            size={14}
            color="black"
          />
          <Text style={styles.interactionText}>스크랩</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
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
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>취업게시판</Text>
            <Text style={styles.headerSubtitle}>
              {userInfo ? userInfo.univ_name : selectedUniversity}
            </Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.searchIcon}
              onPress={() => navigation.navigate('Search', { setSearchQuery })}
            >
              <Ionicons name="search" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNavigateToMyPage}>
              <Ionicons name="person" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        <FlatList
          data={filteredQuestions}
          renderItem={renderItem}
          keyExtractor={(item) => {
            if (!item.id) {
              console.error('Question item is missing an id:', item);
              return '';
            }
            return item.id.toString();
          }}
          contentContainerStyle={styles.listContainer}
        />
        <TouchableOpacity
          style={styles.writeButton}
          onPress={handleWritePost}
        >
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
  postContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginLeft: 10,
  },
  postTextContainer: {
    flex: 1, // Ensure the text container uses remaining space
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

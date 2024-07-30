// SchoolLifeBoardScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { Provider } from 'react-native-paper';
import moment from 'moment';
import 'moment/locale/ko';
import { useNavigation, useRoute } from '@react-navigation/native';

const SchoolLifeBoardScreen = () => {
  const [questions, setQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const navigation = useNavigation();
  const route = useRoute();
  const { userInfo } = route.params;

  useEffect(() => {
    moment.locale('ko');
    const initialPosts = [
      { id: '1', title: '수강 신청 어떻게 하나요?', content: '막막해요!', created_at: '2023-07-29T12:00:00Z', likes: 5, scrapped: false, liked: false, username: 'minsu', category_id: 2 },

    ];
    setQuestions(initialPosts);
    setFilteredQuestions(initialPosts);
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setFilteredQuestions(questions.filter(question =>
        question.title.includes(searchQuery) || question.content.includes(searchQuery)
      ));
    } else {
      setFilteredQuestions(questions);
    }
  }, [searchQuery, questions]);

  const handleToggleLike = (id, liked) => {
    const updatedQuestions = questions.map(question =>
      question.id === id ? { ...question, likes: question.likes + (liked ? -1 : 1), liked: !question.liked } : question
    );
    setQuestions(updatedQuestions);
    setFilteredQuestions(updatedQuestions);
  };

  const handleToggleScrap = (id, scrapped) => {
    const updatedQuestions = questions.map(question =>
      question.id === id ? { ...question, scrapped: !question.scrapped } : question
    );
    setQuestions(updatedQuestions);
    setFilteredQuestions(updatedQuestions);
  };

  const formatRelativeTime = (time) => {
    const questionTime = moment(time);
    return moment().diff(questionTime, 'days') >= 1 ? questionTime.format('YYYY-MM-DD') : questionTime.fromNow();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.postContainer} onPress={() => navigation.navigate('PostDetailScreen', { post: item, userInfo })}>
      <Text style={styles.title}>Q. {item.title}</Text>
      <Text style={styles.content}>{item.content}</Text>
      <View style={styles.row}>
        <Ionicons name="person-circle" size={18} color="#2c3e50" />
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.time}>{formatRelativeTime(item.created_at)}</Text>
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
            <Text style={styles.headerTitle}>학교생활게시판</Text>
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
          data={filteredQuestions}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
        <TouchableOpacity style={styles.writeButton} onPress={() => navigation.navigate('WritePostScreen', { userInfo, category_id: 2 })}>
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

export default SchoolLifeBoardScreen;

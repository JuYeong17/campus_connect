import React, { useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, Dimensions, TouchableOpacity, Alert, Modal, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { updateUserPoints } from '../api'; // Assume this is the correct path to your API functions

// Dimensions for responsive design
const { width } = Dimensions.get('window');

const PointShopScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [selectedItem, setSelectedItem] = useState(null);
  const { userInfo } = route.params;
  const [userPoints, setUserPoints] = useState(userInfo.points);

  // Sample data for the Point Shop
  const items = [
    { id: '1', photo: 'https://www.biz-con.co.kr/upload/images/202312/400_20231219104804672_2.jpg', itemName: '스타벅스 아이스아메리카노 T', points: 0 },
    { id: '2', photo: 'https://www.biz-con.co.kr/upload/images/202312/400_20231219104805562_5.jpg', itemName: '스타벅스 카페 라떼', points: 300 },
    { id: '3', photo: 'https://www.biz-con.co.kr/upload/images/202312/400_20231219172021306_16.jpg', itemName: '스타벅스 오늘도 달콤하게', points: 150 },
    { id: '4', photo: 'https://www.biz-con.co.kr/upload/images/202404/400_20240416135024260_10.jpg', itemName: '투썸플레이스 아이스박스', points: 400 },
    { id: '5', photo: 'https://www.biz-con.co.kr/upload/images/202404/400_20240430152421627_1.jpg', itemName: '투썸플레이스 우리 팥 빙수', points: 250 },
    { id: '6', photo: 'https://www.biz-con.co.kr/upload/images/202208/400_20220810102057047_%EB%A9%94%EA%B0%80%20%ED%97%A4%EC%9D%B4%EC%A6%90%EB%84%9B%20%EC%95%84%EB%A9%94%EB%A6%AC%EC%B9%B4%EB%85%B8%EC%95%84%EC%9D%B4%EC%8A%A4.jpg', itemName: '메가커피 아이스 아메리카노', points: 350 },
    { id: '7', photo: 'https://www.biz-con.co.kr/upload/images/202208/400_20220810101941366_%EB%A9%94%EA%B0%80%EC%98%A4%EB%A0%88%EC%98%A4%EC%B4%88%EC%BD%94%EB%9D%BC%EB%96%BC.jpg', itemName: '메가커피 오레오초코라떼', points: 180 },
    { id: '8', photo: 'https://www.biz-con.co.kr/upload/images/202208/400_20220810102142990_%EB%A9%94%EA%B0%80%20%EC%82%AC%EA%B3%BC%EC%9C%A0%EC%9E%90%EC%B0%A8.jpg', itemName: '메가커피 사과유자차', points: 270 },
    { id: '9', photo: 'https://www.biz-con.co.kr/upload/images/202301/400_20230116202536785_37.jpg', itemName: '이디야커피 아이스 아메리카노', points: 320 },
    { id: '10', photo: 'https://www.biz-con.co.kr/upload/images/202301/400_20230116202725194_42.jpg', itemName: '이디야커피 아이스 카페모카', points: 290 },
  ];

  const handleItemPurchase = async (item) => {
    if (userPoints >= item.points) {
      try {
        console.log(`Calling API to update points: userId=${userInfo.id}, points=-${item.points}`);
        await updateUserPoints(userInfo.id, -item.points); // Deduct points from the user
        setUserPoints(userPoints - item.points);
        Alert.alert('구매 성공', `${item.itemName}을 구매하셨습니다!`);
      } catch (error) {
        console.error('Error purchasing item:', error);
        Alert.alert('구매 실패', '구매 과정에서 오류가 발생하였습니다.');
      }
    } else {
      Alert.alert('포인트 부족', `포인트가 부족하여 ${item.itemName}을 구매하실 수 없습니다.`);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => setSelectedItem(item)}>
      <View style={styles.itemContainer}>
        <Image source={{ uri: item.photo }} style={styles.itemImage} />
        <Text style={styles.itemPoints}>{item.itemName}</Text>
        <Text style={styles.itemPoints}>{item.points} 포인트</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={30} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>포인트샵</Text>
        </View>
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsText}>포인트: {userPoints}</Text>
        </View>
      </View>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2} // Two columns to display items in a grid layout
        contentContainerStyle={styles.listContainer}
      />

      {selectedItem && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={!!selectedItem}
          onRequestClose={() => setSelectedItem(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>구매 확인</Text>
              <Text>{selectedItem.itemName}을(를) 구매하시겠습니까?</Text>
              <Text>{selectedItem.points} 포인트</Text>
              <View style={styles.modalButtons}>
                <Button title="취소" onPress={() => setSelectedItem(null)} />
                <Button
                  title="구매"
                  onPress={() => {
                    handleItemPurchase(selectedItem);
                    setSelectedItem(null);
                  }}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
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
    alignItems: 'flex-end',
    justifyContent: 'space-between', // Distribute space between children
  },
  backIcon: {
    position: 'absolute',
    left: 16,
    top: 45,
    zIndex: 1,
  },
  headerTitleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    left: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  pointsContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    marginRight: 8,
    top: 2,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  listContainer: {
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  itemContainer: {
    backgroundColor: '#ffffff',
    margin: 8,
    borderRadius: 8,
    elevation: 2,
    alignItems: 'center',
    paddingVertical: 10,
  },
  itemImage: {
    width: width / 2 - 24, // Width of the image (half of the screen width minus margin)
    height: width / 2 - 24, // Maintain aspect ratio (square images)
    borderRadius: 8,
  },
  itemPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
});

export default PointShopScreen;

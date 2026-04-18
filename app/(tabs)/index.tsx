import { DailySummaryCard } from '@/components/DailySummaryCard';
import { PaymentCard } from '@/components/PaymentCard';
import { Text, View } from '@/components/Themed';
import { useDailySummary } from '@/hooks/useDailySummary';
import { usePayments } from '@/hooks/usePayments';
import { Payment } from '@/models/payment';
import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';

const EmptyPaymentList:React.FC = () => (
  <Text style={styles.emptyText}>No Payments yet. Tap + to add one. </Text>
)

const HomeScreen:React.FC = () => {
  const {payment, removePayment, isLoading} = usePayments();
  const Summary = useDailySummary(payment);
  
  if(isLoading){
    return(
      <View style = {styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ADE80"/>
      </View>
    );
  }

  return(
    <View style = {styles.container}>
      <Text style = {styles.title}>Tap Track</Text>

      <DailySummaryCard summary={Summary}/>

      <Text style = {styles.sectionTitle}>Today's Payment</Text>

      <FlatList 
        data = {payment}
        keyExtractor = {(item: Payment) => item.id}
        renderItem = {({ item }) => (
          <PaymentCard payment={item} onDelete={removePayment}/>
        )}
        ListEmptyComponent={<EmptyPaymentList/>}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#121218",
    flex:1,
    padding: 16,
  },
  loadingContainer: {
    flex:1,
    backgroundColor: "#121218",
    alignItems: "center",
    justifyContent: "center", 
},
title:{
  color: "#FFFFFF",
  fontSize: 28,
  marginBottom: 16,
  fontWeight: "bold",
},
sectionTitle:{
  color:"#FFFFFF",
  fontSize: 18,
  fontWeight: "bold",
  marginTop: 20,
  marginBottom: 12,
},
emptyText:{
  color:"#888",
  textAlign:"center",
  marginTop: 20,
  fontSize: 15,
},
})

export default HomeScreen;
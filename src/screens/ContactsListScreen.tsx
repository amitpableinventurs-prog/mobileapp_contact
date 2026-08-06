import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { FAB, Searchbar, Text } from 'react-native-paper';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { fetchContacts } from '../api/contacts';
import { ContactCard } from '../components/ContactCard';
import { EmptyState } from '../components/EmptyState';
import { LoadingView } from '../components/LoadingView';
import { RootNavigationProp } from '../navigation/types';

export default function ContactsListScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<RootNavigationProp>();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const isClerk = user?.permissions.is_clerk ?? false;
  const canSearchYet = !isClerk || search.length >= 3;

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, refetch, isRefetching } =
    useInfiniteQuery({
      queryKey: ['contacts', search],
      queryFn: ({ pageParam }) =>
        fetchContacts({ q: search || undefined, number: search || undefined, page: pageParam, per_page: 25 }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.current_page < lastPage.last_page ? lastPage.current_page + 1 : undefined,
      enabled: canSearchYet,
    });

  const contacts = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder={isClerk ? 'Search by phone number…' : 'Search name, phone, email, company…'}
        value={searchInput}
        onChangeText={setSearchInput}
        style={styles.search}
        keyboardType={isClerk ? 'phone-pad' : 'default'}
      />

      {!canSearchYet ? (
        <EmptyState
          icon="magnify"
          title="Search to find a contact"
          subtitle="Type at least 3 digits of a phone number."
        />
      ) : isLoading ? (
        <LoadingView />
      ) : contacts.length === 0 ? (
        <EmptyState icon="account-search-outline" title="No contacts found" />
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ContactCard
              contact={item}
              onPress={() => navigation.navigate('ContactDetail', { id: item.id })}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          onEndReachedThreshold={0.4}
          onEndReached={() => hasNextPage && fetchNextPage()}
          refreshing={isRefetching}
          onRefresh={refetch}
          ListFooterComponent={isFetchingNextPage ? <LoadingView /> : null}
          contentContainerStyle={styles.listContent}
        />
      )}

      {user?.permissions.contacts_create ? (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => navigation.navigate('ContactForm', { mode: 'create' })}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  search: { margin: 12, elevation: 0 },
  listContent: { paddingBottom: 96 },
  separator: { height: 1, backgroundColor: '#EEF0F3', marginLeft: 72 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});

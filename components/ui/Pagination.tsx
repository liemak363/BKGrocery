import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Pagination = ({ totalItems, itemsPerPage = 10, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const renderPages = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pages.map((page, index) => {
      if (page === '...') {
        return (
          <Text key={index} style={styles.ellipsis}>...</Text>
        );
      }

      const isActive = page === currentPage;
      return (
        <TouchableOpacity
          key={index}
          style={[styles.pageButton, isActive && styles.activePage]}
          onPress={() => onPageChange(page)}
        >
          <Text style={isActive ? styles.activeText : styles.pageText}>{page}</Text>
        </TouchableOpacity>
      );
    });
  };

  return (
    <View style={styles.pagination}>
      <TouchableOpacity
        style={styles.pageButton}
        disabled={currentPage === 1}
        onPress={() => onPageChange(currentPage - 1)}
      >
        <Text style={styles.pageText}>{'<'}</Text>
      </TouchableOpacity>

      {renderPages()}

      <TouchableOpacity
        style={styles.pageButton}
        disabled={currentPage === totalPages}
        onPress={() => onPageChange(currentPage + 1)}
      >
        <Text style={styles.pageText}>{'>'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  pageButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f0f0f0',
  },
  pageText: {
    fontSize: 16,
    color: '#333',
  },
  activePage: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  activeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  ellipsis: {
    fontSize: 16,
    color: '#999',
    marginHorizontal: 6,
  },
});

export default Pagination;

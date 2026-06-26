import { AppTextInput } from 'components/input/TextInput';
import { AppText } from 'components/text/AppText';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';

interface TodoItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
}

export default function DetailToDoScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const addTodo = () => {
    if (!title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề');
      return;
    }

    const newTodo: TodoItem = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      completed: false,
      createdAt: new Date(),
    };

    setTodos([newTodo, ...todos]);
    setTitle('');
    setDescription('');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <AppTextInput
          placeholder="Nhập tiêu đề todo..."
          value={title}
          onChangeText={setTitle}
        />
        <AppTextInput
          style={styles.textArea}
          placeholder="Mô tả (tùy chọn)..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTodo}>
          <AppText style={styles.addButtonText}>Thêm Todo</AppText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.todoList}>
        {todos.length === 0 ? (
          <View style={styles.emptyState}>
            <AppText style={styles.emptyText}>Chưa có todo nào</AppText>
            <AppText style={styles.emptySubText}>Thêm todo đầu tiên của bạn!</AppText>
          </View>
        ) : (
          todos.map(todo => (
            <View key={todo.id} style={styles.todoItem}>
              <TouchableOpacity
                style={styles.todoContent}
                onPress={() => toggleTodo(todo.id)}
              >
                <View style={[
                  styles.checkbox,
                  todo.completed && styles.checkboxCompleted
                ]}>
                  {todo.completed && <AppText style={styles.checkmark}>✓</AppText>}
                </View>
                <View style={styles.todoText}>
                  <AppText style={[
                    styles.todoTitle,
                    todo.completed && styles.completedText
                  ]}>
                    {todo.title}
                  </AppText>
                  {todo.description && (
                    <AppText style={[
                      styles.todoDescription,
                      todo.completed && styles.completedText
                    ]}>
                      {todo.description}
                    </AppText>
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteTodo(todo.id)}
              >
                <AppText style={styles.deleteButtonText}>🗑️</AppText>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: ITheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.color.background.app,
  },
  header: {
    paddingTop: theme.dimensions.p50,
    paddingHorizontal: theme.dimensions.p20,
    paddingBottom: theme.dimensions.p20,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.border.light,
  },
  backButton: {
    marginBottom: theme.dimensions.p10,
  },
  backButtonText: {
    color: theme.color.text.primary,
    fontSize: theme.fontSize.p16,
  },
  title: {
    fontSize: theme.fontSize.p24,
    fontWeight: 'bold',
    color: theme.color.text.primary,
  },
  form: {
    padding: theme.dimensions.p20,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: theme.color.button.primaryBg,
    borderRadius: theme.dimensions.p12,
    paddingVertical: theme.dimensions.p14,
    alignItems: 'center',
    marginTop: theme.dimensions.p8,
  },
  addButtonText: {
    color: theme.color.button.primaryText,
    fontSize: theme.fontSize.p16,
    fontWeight: 'bold',
  },
  todoList: {
    flex: 1,
    paddingHorizontal: theme.dimensions.p20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.dimensions.p40,
  },
  emptyText: {
    color: theme.color.text.primary,
    fontSize: theme.fontSize.p16,
    fontWeight: 'bold',
    marginBottom: theme.dimensions.p8,
  },
  emptySubText: {
    color: theme.color.text.secondary,
    fontSize: theme.fontSize.p14,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.color.background.surfaceAlt,
    borderRadius: theme.dimensions.p12,
    padding: theme.dimensions.p16,
    marginBottom: theme.dimensions.p12,
  },
  todoContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.color.border.default,
    marginRight: theme.dimensions.p12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: theme.color.primary.actionGreen,
    borderColor: theme.color.primary.actionGreen,
  },
  checkmark: {
    color: theme.color.text.inverse,
    fontSize: theme.fontSize.p14,
    fontWeight: 'bold',
  },
  todoText: {
    flex: 1,
  },
  todoTitle: {
    color: theme.color.text.primary,
    fontSize: theme.fontSize.p16,
    fontWeight: '600',
    marginBottom: theme.dimensions.p4,
  },
  todoDescription: {
    color: theme.color.text.secondary,
    fontSize: theme.fontSize.p14,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  deleteButton: {
    padding: theme.dimensions.p8,
  },
  deleteButtonText: {
    fontSize: theme.fontSize.p16,
  },
});
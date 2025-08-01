import React, { useCallback, useEffect, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

interface DocumentEditorProps {
  documentContent: string;
  onDocumentChange: (content: string, cursorPosition?: number) => void;
  isConnected: boolean;
  commentary?: string;
  isAIEditing?: boolean;
}

const { height: screenHeight } = Dimensions.get('window');

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  documentContent,
  onDocumentChange,
  isConnected,
  commentary,
  isAIEditing = false,
}) => {
  const [content, setContent] = useState(documentContent);
  const [selectionStart, setSelectionStart] = useState(0);

  useEffect(() => {
    // Always update content when props change, especially during AI editing
    if (documentContent !== content) {
      setContent(documentContent);
    }
  }, [documentContent, content]);

  const handleTextChange = useCallback((text: string) => {
    // Don't allow user editing while AI is editing
    if (isAIEditing) return;
    
    setContent(text);
    onDocumentChange(text, selectionStart);
  }, [onDocumentChange, selectionStart, isAIEditing]);

  const handleSelectionChange = useCallback((event: any) => {
    const { start } = event.nativeEvent.selection;
    setSelectionStart(start);
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📝 Document Editor</Text>
        <View style={[
          styles.connectionStatus,
          { backgroundColor: isConnected ? '#28a745' : '#dc3545' }
        ]}>
          <Text style={styles.connectionText}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
      </View>

      {/* AI Commentary */}
      {commentary && (
        <View style={styles.commentary}>
          <Text style={styles.commentaryLabel}>💡 AI Commentary:</Text>
          <Text style={styles.commentaryText}>{commentary}</Text>
        </View>
      )}

      {/* Document Editor */}
      <ScrollView style={styles.editorContainer} nestedScrollEnabled>
        <TextInput
          style={[
            styles.editor,
            isAIEditing && styles.editorDisabled
          ]}
          value={content}
          onChangeText={handleTextChange}
          onSelectionChange={handleSelectionChange}
          placeholder={
            isAIEditing 
              ? "AI is editing your document..." 
              : "Start typing your document here... The AI will provide real-time commentary and you can chat about your document below."
          }
          placeholderTextColor="#999"
          multiline
          textAlignVertical="top"
          scrollEnabled={false} // Let ScrollView handle scrolling
          editable={!isAIEditing}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  connectionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  connectionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  commentary: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
    padding: 12,
    margin: 8,
    borderRadius: 4,
  },
  commentaryLabel: {
    fontWeight: '600',
    color: '#1565c0',
    fontSize: 14,
    marginBottom: 4,
  },
  commentaryText: {
    color: '#1565c0',
    fontSize: 13,
    lineHeight: 18,
  },
  editorContainer: {
    flex: 1,
    padding: 15,
  },
  editor: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    fontFamily: 'monospace',
    minHeight: screenHeight * 0.4, // Minimum height for better UX
  },
  editorDisabled: {
    backgroundColor: '#f8f9fa',
    color: '#6c757d',
  },
});

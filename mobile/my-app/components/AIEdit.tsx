import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface AIEditProps {
  documentContent: string;
  selectedText: string;
  onEditRequest: (instruction: string, selectedText: string) => void;
  isConnected: boolean;
  isEditing: boolean;
}

export const AIEdit: React.FC<AIEditProps> = ({
  documentContent,
  selectedText,
  onEditRequest,
  isConnected,
  isEditing,
}) => {
  const [instruction, setInstruction] = useState('');

  const handleEditRequest = useCallback(() => {
    if (!instruction.trim()) {
      Alert.alert('Error', 'Please enter an editing instruction.');
      return;
    }

    if (!isConnected) {
      Alert.alert('Error', 'Not connected to server. Please wait for connection.');
      return;
    }

    onEditRequest(instruction.trim(), selectedText);
    setInstruction('');
  }, [instruction, selectedText, onEditRequest, isConnected]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>✨ AI Document Editor</Text>
        {selectedText && (
          <Text style={styles.selectedText}>
            Selected: &ldquo;{selectedText.substring(0, 30)}{selectedText.length > 30 ? '...' : ''}&rdquo;
          </Text>
        )}
      </View>

      <View style={styles.content}>
        <TextInput
          style={styles.instructionInput}
          value={instruction}
          onChangeText={setInstruction}
          placeholder={
            selectedText
              ? "Ask AI to edit the selected text..."
              : "Ask AI to edit the entire document..."
          }
          placeholderTextColor="#999"
          multiline
          maxLength={500}
          editable={!isEditing}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.editButton,
              (!instruction.trim() || !isConnected || isEditing) && styles.editButtonDisabled,
            ]}
            onPress={handleEditRequest}
            disabled={!instruction.trim() || !isConnected || isEditing}
          >
            {isEditing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.editButtonText}>Editing...</Text>
              </View>
            ) : (
              <Text style={styles.editButtonText}>Edit with AI</Text>
            )}
          </TouchableOpacity>
        </View>

        {!isConnected && (
          <Text style={styles.disconnectedText}>
            Disconnected - AI editing unavailable
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    marginBottom: 5,
  },
  selectedText: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  content: {
    padding: 15,
  },
  instructionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    minHeight: 60,
    maxHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
    minWidth: 120,
  },
  editButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginLeft: 5,
  },
  disconnectedText: {
    textAlign: 'center',
    color: '#dc3545',
    fontSize: 12,
    marginTop: 10,
    fontStyle: 'italic',
  },
});

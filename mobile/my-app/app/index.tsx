import React, { useCallback, useEffect, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { AIEdit } from '../components/AIEdit';
import { Chat } from '../components/Chat';
import { DocumentEditor } from '../components/DocumentEditor';
import { useWebSocket } from '../hooks/useWebSocket';
import '../polyfills';

export default function Index() {
  const [documentContent, setDocumentContent] = useState('');
  const [aiCommentary, setAiCommentary] = useState('');
  const [selectedText] = useState('');
  const [isAIEditing, setIsAIEditing] = useState(false);
  
  const { isConnected, connectionStatus, sendMessage, subscribe, unsubscribe } = useWebSocket();

  // Document change handler
  const handleDocumentChange = useCallback((content: string, cursorPosition?: number) => {
    setDocumentContent(content);
    
    // Don't send WebSocket updates while AI is editing to prevent feedback loops
    if (!isAIEditing) {
      // Send document update via WebSocket
      sendMessage({
        type: 'document-update',
        content,
        cursorPosition,
        selection: { start: cursorPosition || 0, end: cursorPosition || 0 },
      });
    }
  }, [sendMessage, isAIEditing]);

  // Set up WebSocket event listeners
  useEffect(() => {
    // Document synchronization
    subscribe('document-sync', (data: any) => {
      setDocumentContent(data.content);
    });

    // Document updates from other clients
    subscribe('document-update', (data: any) => {
      setDocumentContent(data.content);
    });

    // AI Commentary
    subscribe('ai-commentary', (data: any) => {
      // Only show commentary if AI is not currently editing
      if (!isAIEditing) {
        setAiCommentary(data.commentary);
        // Auto-hide commentary after 10 seconds
        setTimeout(() => setAiCommentary(''), 10000);
      }
    });

    // AI Edit streaming
    subscribe('ai-edit-stream-start', () => {
      console.log('AI edit started');
      setIsAIEditing(true);
      // Clear document content to start fresh with AI edit
      setDocumentContent('');
    });

    subscribe('ai-edit-stream-chunk', (data: any) => {
      // Directly update document content with streaming chunks
      setDocumentContent(prev => prev + data.chunk);
    });

    subscribe('ai-edit-stream-complete', (data: any) => {
      console.log('AI edit completed', data);
      // Ensure final content is set (in case of any missing chunks)
      setDocumentContent(data.editedContent);
      setIsAIEditing(false);
      
      // Note: Don't call handleDocumentChange here to avoid feedback loop
      // The server already has the edited content and will sync to other clients
    });

    subscribe('ai-edit-error', (data: any) => {
      console.error('AI edit error:', data);
      setIsAIEditing(false);
      // Keep the document content as-is on error
    });

    // Cleanup function
    return () => {
      unsubscribe('document-sync');
      unsubscribe('document-update');
      unsubscribe('ai-commentary');
      unsubscribe('ai-edit-stream-start');
      unsubscribe('ai-edit-stream-chunk');
      unsubscribe('ai-edit-stream-complete');
      unsubscribe('ai-edit-error');
    };
  }, [subscribe, unsubscribe, handleDocumentChange, isAIEditing]);

  const handleAIEditRequest = useCallback((instruction: string, selectedText: string) => {
    sendMessage({
      type: 'ai-document-edit-request',
      instruction,
      selectedText,
      documentContext: documentContent,
    });
  }, [sendMessage, documentContent]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🤖 AI Chat & Document Editor</Text>
        <Text style={styles.headerSubtitle}>Real-time collaborative document editing with AI assistance</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Document Editor */}
        <DocumentEditor
          documentContent={documentContent}
          onDocumentChange={handleDocumentChange}
          isConnected={isConnected}
          commentary={aiCommentary}
          isAIEditing={isAIEditing}
        />

        {/* AI Edit Component */}
        <AIEdit
          documentContent={documentContent}
          selectedText={selectedText}
          onEditRequest={handleAIEditRequest}
          isConnected={isConnected}
          isEditing={isAIEditing}
        />

        {/* Chat Component */}
        <Chat documentContent={documentContent} />
        
        {/* Connection Status */}
        <View style={styles.footer}>
          <Text style={[
            styles.connectionText,
            { color: isConnected ? '#28a745' : '#dc3545' }
          ]}>
            {connectionStatus === 'connecting' && '🔄 Connecting...'}
            {connectionStatus === 'connected' && '✅ Connected to server'}
            {connectionStatus === 'disconnected' && '❌ Disconnected from server'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  footer: {
    padding: 15,
    alignItems: 'center',
  },
  connectionText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

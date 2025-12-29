/**
 * AKLOW WebsiteBot Widget
 * 
 * Embed Snippet:
 * <script src="https://your-domain.com/widget.js" data-site-key="YOUR_SITE_KEY" async></script>
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    apiUrl: null, // Will be loaded from config
    storageKey: 'aklow_widget_thread_id',
    animationDuration: 200,
    maxHeight: '600px',
    minWidth: '320px',
    maxWidth: '400px',
  };

  // Load API URL from config
  async function loadConfig() {
    try {
      const script = document.querySelector('script[data-site-key]');
      
      // 1. Prefer data-api-url attribute on script tag
      if (script && script.getAttribute('data-api-url')) {
        CONFIG.apiUrl = script.getAttribute('data-api-url');
        return;
      }

      // 2. Try to get from window (set by host page)
      if (window.AKLOW_WIDGET_API_URL) {
        CONFIG.apiUrl = window.AKLOW_WIDGET_API_URL;
        return;
      }
      
      // 3. Try to get from same origin API (Next.js route)
      if (script && script.src) {
        const scriptUrl = new URL(script.src);
        const configUrl = scriptUrl.origin + '/api/widget-config';
        const response = await fetch(configUrl);
        if (response.ok) {
          const data = await response.json();
          if (data.apiUrl) {
            CONFIG.apiUrl = data.apiUrl;
            return;
          }
        }
      }
      
      console.warn('AKLOW Widget: No API URL configured. Please set data-api-url or check server config.');
      CONFIG.apiUrl = null;
    } catch (error) {
      console.error('AKLOW Widget: Could not load config', error);
      CONFIG.apiUrl = null;
    }
  }

  // State
  let siteKey = null;
  let threadId = null;
  let isOpen = false;
  let isLoading = false;

  // DOM Elements
  let bubble = null;
  let chatWindow = null;
  let messagesContainer = null;
  let inputField = null;
  let sendButton = null;

  // Initialize
  async function init() {
    // Load config first
    await loadConfig();
    
    // Get site_key from script tag
    const script = document.querySelector('script[data-site-key]');
    if (!script) {
      console.error('AKLOW Widget: data-site-key attribute not found');
      return;
    }

    siteKey = script.getAttribute('data-site-key');
    if (!siteKey) {
      console.error('AKLOW Widget: site-key is empty');
      return;
    }

    // Get or create thread_id
    threadId = localStorage.getItem(CONFIG.storageKey + '_' + siteKey);
    if (!threadId) {
      threadId = generateUUID();
      localStorage.setItem(CONFIG.storageKey + '_' + siteKey, threadId);
    }

    // Create UI
    createBubble();
    createChatWindow();

    // Load previous messages if any
    loadPreviousMessages();
  }

  // Generate UUID
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Create floating bubble
  function createBubble() {
    bubble = document.createElement('div');
    bubble.id = 'aklow-widget-bubble';
    bubble.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
      </svg>
    `;
    bubble.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 56px;
      height: 56px;
      background: #0066CC;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 999998;
      transition: transform 0.2s ease;
      color: white;
    `;
    bubble.addEventListener('click', toggleChat);
    bubble.addEventListener('mouseenter', () => {
      bubble.style.transform = 'scale(1.1)';
    });
    bubble.addEventListener('mouseleave', () => {
      bubble.style.transform = 'scale(1)';
    });
    document.body.appendChild(bubble);
  }

  // Create chat window
  function createChatWindow() {
    chatWindow = document.createElement('div');
    chatWindow.id = 'aklow-widget-chat';
    chatWindow.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%;">
        <div style="padding: 16px; border-bottom: 1px solid #e5e5e5; background: #f5f5f5; border-radius: 12px 12px 0 0;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #1d1d1f;">AKLOW Chat</h3>
            <button id="aklow-widget-close" style="background: none; border: none; cursor: pointer; padding: 4px; color: #666;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>
        <div id="aklow-widget-messages" style="flex: 1; overflow-y: auto; padding: 16px; background: white;">
          <div style="text-align: center; color: #666; font-size: 14px; padding: 20px;">
            Willkommen! Wie kann ich dir helfen?
          </div>
        </div>
        <div style="padding: 12px; border-top: 1px solid #e5e5e5; background: #f5f5f5; border-radius: 0 0 12px 12px;">
          <div style="display: flex; gap: 8px;">
            <input 
              id="aklow-widget-input" 
              type="text" 
              placeholder="Nachricht eingeben..."
              style="flex: 1; padding: 10px 12px; border: 1px solid #d1d1d1; border-radius: 8px; font-size: 14px; outline: none;"
            />
            <button 
              id="aklow-widget-send" 
              style="padding: 10px 20px; background: #0066CC; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;"
            >
              Senden
            </button>
          </div>
        </div>
      </div>
    `;
    chatWindow.style.cssText = `
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: ${CONFIG.minWidth};
      max-width: ${CONFIG.maxWidth};
      height: ${CONFIG.maxHeight};
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      z-index: 999999;
      display: none;
      flex-direction: column;
      overflow: hidden;
    `;
    document.body.appendChild(chatWindow);

    // Get references
    messagesContainer = document.getElementById('aklow-widget-messages');
    inputField = document.getElementById('aklow-widget-input');
    sendButton = document.getElementById('aklow-widget-send');
    const closeButton = document.getElementById('aklow-widget-close');

    // Event listeners
    closeButton.addEventListener('click', toggleChat);
    sendButton.addEventListener('click', sendMessage);
    inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  // Toggle chat window
  function toggleChat() {
    isOpen = !isOpen;
    if (isOpen) {
      chatWindow.style.display = 'flex';
      chatWindow.style.animation = 'fadeInUp 0.2s ease';
      inputField.focus();
    } else {
      chatWindow.style.display = 'none';
    }
  }

  // Add message to UI
  function addMessage(text, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
      margin-bottom: 12px;
      display: flex;
      justify-content: ${isUser ? 'flex-end' : 'flex-start'};
    `;
    messageDiv.innerHTML = `
      <div style="
        max-width: 75%;
        padding: 10px 14px;
        border-radius: 12px;
        background: ${isUser ? '#0066CC' : '#f5f5f5'};
        color: ${isUser ? 'white' : '#1d1d1f'};
        font-size: 14px;
        line-height: 1.4;
        word-wrap: break-word;
      ">${escapeHtml(text)}</div>
    `;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }

  // Render Actions (B2)
  function renderActions(actions) {
    if (!actions || actions.length === 0) return;
    
    const actionsContainer = document.createElement('div');
    actionsContainer.style.cssText = `
      margin-top: 10px;
      margin-bottom: 12px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    `;
    
    actions.forEach(action => {
      const button = document.createElement('button');
      button.style.cssText = `
        padding: 8px 16px;
        background: #f0f4f8;
        border: 1px solid #0066CC;
        border-radius: 20px;
        color: #0066CC;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      `;
      
      let label = action.description || 'Aktion';
      if (action.type === 'show_pricing') label = 'Preise ansehen';
      if (action.type === 'book_call') label = 'Termin buchen';
      if (action.type === 'lead_capture') label = 'Kontakt hinterlassen';
      if (action.type === 'handoff') label = 'Mit Mensch sprechen';
      
      button.textContent = label;
      
      button.addEventListener('mouseenter', () => {
        button.style.background = '#0066CC';
        button.style.color = 'white';
      });
      button.addEventListener('mouseleave', () => {
        button.style.background = '#f0f4f8';
        button.style.color = '#0066CC';
      });
      
      button.addEventListener('click', () => handleActionClick(action, button));
      actionsContainer.appendChild(button);
    });
    
    messagesContainer.appendChild(actionsContainer);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  async function handleActionClick(action, button) {
    if (isLoading) return;
    
    const originalText = button.textContent;
    
    if (action.type === 'show_pricing') {
      const url = action.args?.url || `${window.location.origin}/pricing`;
      window.open(url, '_blank');
    } else if (action.type === 'book_call') {
      const url = action.args?.url || `${window.location.origin}/kontakt`;
      window.open(url, '_blank');
    } else if (action.type === 'handoff') {
      button.disabled = true;
      button.textContent = 'Verbinde...';
      try {
        const response = await fetch(CONFIG.apiUrl + '/public/website/handoff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            site_key: siteKey,
            thread_id: threadId,
            reason: action.description,
            visitor_id: localStorage.getItem('aklow_visitor_id')
          })
        });
        if (response.ok) {
          button.textContent = 'Anfrage gesendet ✓';
          addMessage('Vielen Dank. Ein Mitarbeiter wird sich in Kürze bei dir melden.', false);
        } else {
          throw new Error('Handoff failed');
        }
      } catch (err) {
        button.disabled = false;
        button.textContent = originalText;
        console.error('Handoff error:', err);
      }
    } else if (action.type === 'lead_capture') {
      showLeadForm(button);
    }
  }

  function showLeadForm(triggerButton) {
    const formOverlay = document.createElement('div');
    formOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.95);
      z-index: 10;
      display: flex;
      flex-direction: column;
      padding: 20px;
      box-sizing: border-box;
      border-radius: 12px;
    `;
    
    formOverlay.innerHTML = `
      <h4 style="margin: 0 0 15px 0; font-size: 16px;">Kontakt hinterlassen</h4>
      <input type="text" id="aklow-lead-name" placeholder="Name" style="margin-bottom: 10px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
      <input type="email" id="aklow-lead-email" placeholder="E-Mail" style="margin-bottom: 10px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
      <input type="tel" id="aklow-lead-phone" placeholder="Telefon (optional)" style="margin-bottom: 10px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
      <textarea id="aklow-lead-message" placeholder="Deine Nachricht" style="margin-bottom: 15px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; flex: 1;"></textarea>
      <div style="display: flex; gap: 10px;">
        <button id="aklow-lead-cancel" style="flex: 1; padding: 10px; background: #eee; border: none; border-radius: 4px; cursor: pointer;">Abbrechen</button>
        <button id="aklow-lead-submit" style="flex: 2; padding: 10px; background: #0066CC; color: white; border: none; border-radius: 4px; cursor: pointer;">Absenden</button>
      </div>
    `;
    
    chatWindow.querySelector('div').appendChild(formOverlay);
    
    formOverlay.querySelector('#aklow-lead-cancel').onclick = () => formOverlay.remove();
    formOverlay.querySelector('#aklow-lead-submit').onclick = async () => {
      const name = formOverlay.querySelector('#aklow-lead-name').value;
      const email = formOverlay.querySelector('#aklow-lead-email').value;
      const phone = formOverlay.querySelector('#aklow-lead-phone').value;
      const message = formOverlay.querySelector('#aklow-lead-message').value;
      
      if (!email && !phone) {
        alert('Bitte gib eine E-Mail oder Telefonnummer an.');
        return;
      }
      
      const submitBtn = formOverlay.querySelector('#aklow-lead-submit');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sende...';
      
      try {
        const response = await fetch(CONFIG.apiUrl + '/public/website/lead-capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            site_key: siteKey,
            thread_id: threadId,
            name,
            email,
            phone,
            message
          })
        });
        
        if (response.ok) {
          formOverlay.remove();
          addMessage('Vielen Dank für deine Nachricht. Wir haben deine Kontaktdaten erhalten.', false);
        } else {
          throw new Error('Lead capture failed');
        }
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Absenden';
        console.error('Lead capture error:', err);
      }
    };
  }

  // Send message
  async function sendMessage() {
    const message = inputField.value.trim();
    if (!message || isLoading) return;

    // Add user message to UI
    addMessage(message, true);
    inputField.value = '';
    inputField.disabled = true;
    sendButton.disabled = true;
    isLoading = true;

    // Show loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'aklow-widget-loading';
    loadingDiv.style.cssText = `
      margin-bottom: 12px;
      display: flex;
      justify-content: flex-start;
    `;
    loadingDiv.innerHTML = `
      <div style="
        padding: 10px 14px;
        border-radius: 12px;
        background: #f5f5f5;
        font-size: 14px;
        color: #666;
      ">
        <span style="display: inline-block; width: 12px; height: 12px; border: 2px solid #666; border-top-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite;"></span>
        Denkt nach...
      </div>
    `;
    messagesContainer.appendChild(loadingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
      // Get page metadata
      const pageUrl = window.location.href;
      const referrer = document.referrer;
      const userAgent = navigator.userAgent;
      const visitorId = localStorage.getItem('aklow_visitor_id') || generateUUID();
      if (!localStorage.getItem('aklow_visitor_id')) {
        localStorage.setItem('aklow_visitor_id', visitorId);
      }

      // Send request
      const response = await fetch(CONFIG.apiUrl + '/public/website/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          site_key: siteKey,
          message: message,
          thread_id: threadId,
          page_url: pageUrl,
          referrer: referrer,
          user_agent: userAgent,
          visitor_id: visitorId,
        }),
      });

      // Remove loading indicator
      const loading = document.getElementById('aklow-widget-loading');
      if (loading) loading.remove();

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const data = await response.json();
      
      // Update thread_id if provided
      if (data.thread_id && data.thread_id !== threadId) {
        threadId = data.thread_id;
        localStorage.setItem(CONFIG.storageKey + '_' + siteKey, threadId);
      }

      // Add assistant response
      if (data.reply_text) {
        addMessage(data.reply_text, false);
      }

      // Handle actions (B2)
      if (data.actions && data.actions.length > 0) {
        renderActions(data.actions);
      }

      // Handle suggested questions
      if (data.suggested_next_questions && data.suggested_next_questions.length > 0) {
        setTimeout(() => {
          const suggestionsDiv = document.createElement('div');
          suggestionsDiv.style.cssText = 'margin-top: 8px; display: flex; flex-direction: column; gap: 6px;';
          data.suggested_next_questions.forEach((question) => {
            const btn = document.createElement('button');
            btn.textContent = question;
            btn.style.cssText = `
              padding: 8px 12px;
              background: white;
              border: 1px solid #d1d1d1;
              border-radius: 8px;
              font-size: 13px;
              text-align: left;
              cursor: pointer;
              transition: all 0.2s;
            `;
            btn.addEventListener('mouseenter', () => {
              btn.style.background = '#f5f5f5';
              btn.style.borderColor = '#0066CC';
            });
            btn.addEventListener('mouseleave', () => {
              btn.style.background = 'white';
              btn.style.borderColor = '#d1d1d1';
            });
            btn.addEventListener('click', () => {
              inputField.value = question;
              sendMessage();
            });
            suggestionsDiv.appendChild(btn);
          });
          messagesContainer.appendChild(suggestionsDiv);
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 300);
      }

    } catch (error) {
      console.error('AKLOW Widget error:', error);
      const loading = document.getElementById('aklow-widget-loading');
      if (loading) loading.remove();
      addMessage('Entschuldigung, es ist ein Fehler aufgetreten. Bitte versuche es später erneut.', false);
    } finally {
      inputField.disabled = false;
      sendButton.disabled = false;
      isLoading = false;
      inputField.focus();
    }
  }

  // Load previous messages (optional, for now just clear)
  function loadPreviousMessages() {
    // Could load from localStorage or API
    // For now, start fresh each session
  }

  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    #aklow-widget-messages::-webkit-scrollbar {
      width: 6px;
    }
    #aklow-widget-messages::-webkit-scrollbar-track {
      background: #f1f1f1;
    }
    #aklow-widget-messages::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 3px;
    }
    #aklow-widget-messages::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  `;
  document.head.appendChild(style);

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


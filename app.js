// Sample Data
const PRODUCTS = [
  { name: 'Dell Latitude 5520 Laptop', sku: 'LAP-DELL-5520', quantity: 45, price: 1299.99, supplier: 'Dell Inc', location: 'Warehouse A', reorder_level: 20 },
  { name: 'HP EliteBook 840 Laptop', sku: 'LAP-HP-840', quantity: 12, price: 1449.99, supplier: 'HP Enterprise', location: 'Warehouse A', reorder_level: 15 },
  { name: 'Lenovo ThinkPad X1', sku: 'LAP-LEN-X1', quantity: 28, price: 1599.99, supplier: 'Lenovo Corp', location: 'Warehouse B', reorder_level: 20 },
  { name: 'MacBook Pro 14', sku: 'LAP-MAC-PRO14', quantity: 8, price: 2499.99, supplier: 'Apple Inc', location: 'Warehouse A', reorder_level: 10 },
  { name: 'Office Chair Pro', sku: 'FUR-CHAIR-001', quantity: 67, price: 299.99, supplier: 'Office Furniture Co', location: 'Warehouse C', reorder_level: 30 },
  { name: 'Standing Desk Electric', sku: 'FUR-DESK-002', quantity: 23, price: 599.99, supplier: 'ErgoWorks', location: 'Warehouse C', reorder_level: 15 },
  { name: 'Wireless Mouse MX Master', sku: 'ACC-MOUSE-MX', quantity: 156, price: 99.99, supplier: 'Logitech', location: 'Warehouse B', reorder_level: 50 },
  { name: 'Mechanical Keyboard RGB', sku: 'ACC-KB-RGB', quantity: 89, price: 149.99, supplier: 'Corsair', location: 'Warehouse B', reorder_level: 40 }
];

const ORDERS = [
  { order_id: '12345', customer: 'Acme Corporation', status: 'In Transit', items: 5, total: 12450.00, date: '2025-10-20', delivery_date: '2025-10-29' },
  { order_id: '12346', customer: 'TechStart Inc', status: 'Delivered', items: 12, total: 8950.00, date: '2025-10-15', delivery_date: '2025-10-22' },
  { order_id: '12347', customer: 'Global Solutions Ltd', status: 'Processing', items: 8, total: 15670.00, date: '2025-10-25', delivery_date: '2025-11-02' },
  { order_id: '12348', customer: 'Innovate Systems', status: 'Pending Approval', items: 3, total: 4500.00, date: '2025-10-26', delivery_date: '2025-11-05' }
];

const FINANCIAL_DATA = {
  october_2025: { revenue: 245680, expenses: 156420, profit: 89260, margin: 36.4, growth: 12 },
  september_2025: { revenue: 219350, expenses: 145230, profit: 74120, margin: 33.8 },
  q3_2025: { revenue: 687450, expenses: 445680, profit: 241770, margin: 35.2 }
};

const EMPLOYEES = [
  { id: 'EMP001', name: 'Sarah Johnson', department: 'Sales', position: 'Sales Manager', leave_balance: 12 },
  { id: 'EMP002', name: 'Michael Chen', department: 'IT', position: 'System Administrator', leave_balance: 8 },
  { id: 'EMP003', name: 'Emily Rodriguez', department: 'Finance', position: 'Financial Analyst', leave_balance: 15 },
  { id: 'EMP004', name: 'David Kumar', department: 'HR', position: 'HR Manager', leave_balance: 6 }
];

// State Management
let conversationContext = {
  lastTopic: null,
  lastQuery: null,
  recentQueries: []
};

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const typingIndicator = document.getElementById('typingIndicator');
const recentQueriesContainer = document.getElementById('recentQueries');

// Utility Functions
function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Message Rendering
function addMessage(text, isUser = false, quickReplies = null) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
  
  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = isUser ? 'U' : 'AI';
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.innerHTML = text;
  
  const time = document.createElement('div');
  time.className = 'message-time';
  time.textContent = getCurrentTime();
  
  contentDiv.appendChild(bubble);
  contentDiv.appendChild(time);
  
  if (quickReplies && !isUser) {
    const repliesDiv = document.createElement('div');
    repliesDiv.className = 'quick-replies';
    quickReplies.forEach(reply => {
      const btn = document.createElement('button');
      btn.className = 'quick-reply-btn';
      btn.textContent = reply;
      btn.onclick = () => handleUserInput(reply);
      repliesDiv.appendChild(btn);
    });
    contentDiv.appendChild(repliesDiv);
  }
  
  messageDiv.appendChild(avatar);
  messageDiv.appendChild(contentDiv);
  chatMessages.appendChild(messageDiv);
  
  scrollToBottom();
}

function showTypingIndicator() {
  typingIndicator.style.display = 'flex';
  scrollToBottom();
}

function hideTypingIndicator() {
  typingIndicator.style.display = 'none';
}

// Natural Language Processing
function detectIntent(input) {
  const lowerInput = input.toLowerCase();
  
  // Greetings
  if (/^(hi|hello|hey|good morning|good afternoon|good evening)/.test(lowerInput)) {
    return { type: 'greeting' };
  }
  
  // Thanks
  if (/(thank|thanks|appreciate)/.test(lowerInput)) {
    return { type: 'thanks' };
  }
  
  // Help
  if (/(help|assist|what can you|capabilities|features)/.test(lowerInput)) {
    return { type: 'help' };
  }
  
  // Inventory queries
  if (/(inventory|stock|product|item|warehouse|reorder|supply)/.test(lowerInput)) {
    // Check for specific product
    const productMatch = PRODUCTS.find(p => 
      lowerInput.includes(p.name.toLowerCase()) || 
      lowerInput.includes(p.sku.toLowerCase()) ||
      p.name.toLowerCase().split(' ').some(word => lowerInput.includes(word))
    );
    
    if (productMatch) {
      return { type: 'inventory_specific', product: productMatch };
    }
    
    // Check for category
    if (/(laptop|computer)/.test(lowerInput)) {
      return { type: 'inventory_category', category: 'laptop' };
    }
    if (/(furniture|chair|desk)/.test(lowerInput)) {
      return { type: 'inventory_category', category: 'furniture' };
    }
    if (/(accessories|mouse|keyboard)/.test(lowerInput)) {
      return { type: 'inventory_category', category: 'accessories' };
    }
    
    // Low stock check
    if (/(low stock|running low|reorder|need order)/.test(lowerInput)) {
      return { type: 'inventory_low_stock' };
    }
    
    return { type: 'inventory_general' };
  }
  
  // Order tracking
  if (/(order|track|shipment|delivery|customer)/.test(lowerInput)) {
    // Extract order ID
    const orderMatch = lowerInput.match(/(#?\d{5}|ord-?\d{5}|\b\d{5}\b)/);
    if (orderMatch) {
      const orderId = orderMatch[0].replace(/[^\d]/g, '');
      const order = ORDERS.find(o => o.order_id === orderId);
      if (order) {
        return { type: 'order_specific', order };
      }
    }
    return { type: 'order_general' };
  }
  
  // Financial queries
  if (/(financial|finance|revenue|expense|profit|budget|money|sales|income)/.test(lowerInput)) {
    if (/(october|oct|current month|this month)/.test(lowerInput)) {
      return { type: 'financial_monthly', month: 'october_2025' };
    }
    if (/(september|sept|last month)/.test(lowerInput)) {
      return { type: 'financial_monthly', month: 'september_2025' };
    }
    if (/(quarter|q3|quarterly)/.test(lowerInput)) {
      return { type: 'financial_quarterly' };
    }
    return { type: 'financial_summary' };
  }
  
  // Employee queries
  if (/(employee|staff|worker|hr|personnel|team member)/.test(lowerInput)) {
    // Check for employee ID
    const empIdMatch = lowerInput.match(/emp\d{3}/);
    if (empIdMatch) {
      const empId = empIdMatch[0].toUpperCase();
      const employee = EMPLOYEES.find(e => e.id === empId);
      if (employee) {
        return { type: 'employee_specific', employee };
      }
    }
    
    // Check for employee name
    const empMatch = EMPLOYEES.find(e => 
      lowerInput.includes(e.name.toLowerCase()) ||
      e.name.toLowerCase().split(' ').some(word => lowerInput.includes(word))
    );
    if (empMatch) {
      return { type: 'employee_specific', employee: empMatch };
    }
    
    return { type: 'employee_general' };
  }
  
  // Reports
  if (/(report|analytics|data|summary|generate|create report)/.test(lowerInput)) {
    return { type: 'report' };
  }
  
  // System status
  if (/(system|status|online|health|performance)/.test(lowerInput)) {
    return { type: 'system_status' };
  }
  
  return { type: 'unknown' };
}

// Response Generation
function generateResponse(intent) {
  switch (intent.type) {
    case 'greeting':
      return {
        text: `Hello! 👋 I'm your ERP Assistant. I can help you with:<br><br>
        • 📦 Inventory and stock management<br>
        • 🚚 Order tracking and shipments<br>
        • 💰 Financial reports and summaries<br>
        • 👥 Employee information<br>
        • 📊 Custom reports and analytics<br>
        • ⚙️ System status and alerts<br><br>
        What would you like to know?`,
        quickReplies: ['Check inventory', 'Track an order', 'Financial summary']
      };
    
    case 'thanks':
      return {
        text: `You're welcome! 😊 Is there anything else I can help you with?`,
        quickReplies: ['Check inventory', 'View orders', 'Financial report']
      };
    
    case 'help':
      return {
        text: `I'm here to help! Here's what I can do:<br><br>
        <strong>📦 Inventory Management:</strong><br>
        "Check inventory for laptops" or "Show stock levels"<br><br>
        <strong>🚚 Order Tracking:</strong><br>
        "Track order 12345" or "Show my orders"<br><br>
        <strong>💰 Financial Reports:</strong><br>
        "Financial summary" or "Show October revenue"<br><br>
        <strong>👥 Employee Info:</strong><br>
        "Show employee EMP001" or "Sarah Johnson info"<br><br>
        <strong>📊 Reports:</strong><br>
        "Generate sales report" or "Create inventory report"<br><br>
        Just ask me in natural language!`,
        quickReplies: ['Check inventory', 'Track order', 'Financial data']
      };
    
    case 'inventory_general':
      const lowStockItems = PRODUCTS.filter(p => p.quantity < p.reorder_level);
      let inventoryHtml = `<strong>📦 Inventory Overview</strong><br><br>`;
      inventoryHtml += `<strong>Total Products:</strong> ${PRODUCTS.length}<br>`;
      inventoryHtml += `<strong>Low Stock Items:</strong> ${lowStockItems.length}<br><br>`;
      inventoryHtml += `<strong>Stock Summary:</strong><br>`;
      PRODUCTS.slice(0, 5).forEach(p => {
        const isLow = p.quantity < p.reorder_level;
        inventoryHtml += `• ${p.name}: <strong>${p.quantity} units</strong>`;
        if (isLow) {
          inventoryHtml += ` <span class="low-stock">⚠️ Low Stock</span>`;
        }
        inventoryHtml += `<br>`;
      });
      return {
        text: inventoryHtml,
        quickReplies: ['Show all laptops', 'Low stock items', 'Reorder recommendations']
      };
    
    case 'inventory_category':
      const category = intent.category;
      let categoryProducts = [];
      
      if (category === 'laptop') {
        categoryProducts = PRODUCTS.filter(p => p.sku.startsWith('LAP'));
      } else if (category === 'furniture') {
        categoryProducts = PRODUCTS.filter(p => p.sku.startsWith('FUR'));
      } else if (category === 'accessories') {
        categoryProducts = PRODUCTS.filter(p => p.sku.startsWith('ACC'));
      }
      
      let catHtml = `<strong>📦 ${category.charAt(0).toUpperCase() + category.slice(1)} Inventory</strong><br><br>`;
      categoryProducts.forEach(p => {
        const isLow = p.quantity < p.reorder_level;
        catHtml += `• <strong>${p.name}</strong><br>`;
        catHtml += `&nbsp;&nbsp;Stock: ${p.quantity} units`;
        if (isLow) {
          catHtml += ` <span class="low-stock">⚠️ Low Stock</span>`;
        }
        catHtml += `<br>&nbsp;&nbsp;Price: ${formatCurrency(p.price)}<br>&nbsp;&nbsp;Location: ${p.location}<br><br>`;
      });
      return {
        text: catHtml,
        quickReplies: ['Show all inventory', 'Track orders', 'Generate report']
      };
    
    case 'inventory_specific':
      const product = intent.product;
      const isLowStock = product.quantity < product.reorder_level;
      let prodHtml = `<strong>📦 Product Details</strong><br><br>`;
      prodHtml += `<strong>${product.name}</strong><br><br>`;
      prodHtml += `<strong>SKU:</strong> ${product.sku}<br>`;
      prodHtml += `<strong>Stock Level:</strong> ${product.quantity} units`;
      if (isLowStock) {
        prodHtml += ` <span class="alert-badge">⚠️ Low Stock</span>`;
      }
      prodHtml += `<br><strong>Price:</strong> ${formatCurrency(product.price)}<br>`;
      prodHtml += `<strong>Supplier:</strong> ${product.supplier}<br>`;
      prodHtml += `<strong>Location:</strong> ${product.location}<br>`;
      prodHtml += `<strong>Reorder Level:</strong> ${product.reorder_level} units<br><br>`;
      
      if (isLowStock) {
        prodHtml += `<em>💡 Recommendation: Consider reordering ${product.reorder_level * 2 - product.quantity} units</em>`;
      }
      return {
        text: prodHtml,
        quickReplies: isLowStock ? ['Create purchase order', 'View supplier info'] : ['View other products', 'Check orders']
      };
    
    case 'inventory_low_stock':
      const lowStock = PRODUCTS.filter(p => p.quantity < p.reorder_level);
      let lowStockHtml = `<strong>⚠️ Low Stock Alert</strong><br><br>`;
      lowStockHtml += `Found ${lowStock.length} items below reorder level:<br><br>`;
      lowStock.forEach(p => {
        lowStockHtml += `• <strong>${p.name}</strong><br>`;
        lowStockHtml += `&nbsp;&nbsp;Current: ${p.quantity} units | Reorder at: ${p.reorder_level} units<br>`;
        lowStockHtml += `&nbsp;&nbsp;Recommended order: ${p.reorder_level * 2 - p.quantity} units<br>`;
        lowStockHtml += `&nbsp;&nbsp;Supplier: ${p.supplier}<br><br>`;
      });
      return {
        text: lowStockHtml,
        quickReplies: ['Create purchase orders', 'Contact suppliers', 'View full inventory']
      };
    
    case 'order_general':
      let ordersHtml = `<strong>🚚 Order Summary</strong><br><br>`;
      ordersHtml += `<strong>Total Orders:</strong> ${ORDERS.length}<br><br>`;
      ORDERS.forEach(order => {
        let statusIcon = '📦';
        let statusClass = 'info';
        if (order.status === 'Delivered') {
          statusIcon = '✅';
          statusClass = 'success';
        } else if (order.status === 'Pending Approval') {
          statusIcon = '⏳';
          statusClass = 'warning';
        } else if (order.status === 'In Transit') {
          statusIcon = '🚚';
        }
        
        ordersHtml += `${statusIcon} <strong>Order #${order.order_id}</strong><br>`;
        ordersHtml += `&nbsp;&nbsp;Customer: ${order.customer}<br>`;
        ordersHtml += `&nbsp;&nbsp;Status: <span class="status-badge ${statusClass}">${order.status}</span><br>`;
        ordersHtml += `&nbsp;&nbsp;Total: ${formatCurrency(order.total)}<br><br>`;
      });
      return {
        text: ordersHtml,
        quickReplies: ['Track order 12345', 'Pending approvals', 'Delivery schedule']
      };
    
    case 'order_specific':
      const order = intent.order;
      let statusIcon = '📦';
      let statusClass = 'info';
      let statusMessage = '';
      
      if (order.status === 'Delivered') {
        statusIcon = '✅';
        statusClass = 'success';
        statusMessage = `Delivered on ${formatDate(order.delivery_date)}`;
      } else if (order.status === 'In Transit') {
        statusIcon = '🚚';
        const daysUntil = Math.ceil((new Date(order.delivery_date) - new Date()) / (1000 * 60 * 60 * 24));
        statusMessage = `On schedule, arriving in ${daysUntil} days`;
      } else if (order.status === 'Processing') {
        statusIcon = '⚙️';
        statusMessage = 'Order is being prepared for shipment';
      } else if (order.status === 'Pending Approval') {
        statusIcon = '⏳';
        statusClass = 'warning';
        statusMessage = 'Waiting for approval';
      }
      
      let orderHtml = `<strong>${statusIcon} Order #${order.order_id}</strong><br><br>`;
      orderHtml += `<strong>Customer:</strong> ${order.customer}<br>`;
      orderHtml += `<strong>Status:</strong> <span class="status-badge ${statusClass}">${order.status}</span><br>`;
      orderHtml += `<strong>Items:</strong> ${order.items} products<br>`;
      orderHtml += `<strong>Total:</strong> ${formatCurrency(order.total)}<br>`;
      orderHtml += `<strong>Order Date:</strong> ${formatDate(order.date)}<br>`;
      orderHtml += `<strong>Expected Delivery:</strong> ${formatDate(order.delivery_date)}<br><br>`;
      orderHtml += `<em>${statusMessage}</em>`;
      
      return {
        text: orderHtml,
        quickReplies: ['View invoice', 'Contact customer', 'Track all orders']
      };
    
    case 'financial_summary':
    case 'financial_monthly':
      const finData = intent.month ? FINANCIAL_DATA[intent.month] : FINANCIAL_DATA.october_2025;
      const monthName = intent.month === 'september_2025' ? 'September' : 'October';
      
      let finHtml = `<strong>💰 Financial Summary - ${monthName} 2025</strong><br><br>`;
      finHtml += `<strong>Revenue:</strong> ${formatCurrency(finData.revenue)}<br>`;
      finHtml += `<strong>Expenses:</strong> ${formatCurrency(finData.expenses)}<br>`;
      finHtml += `<strong>Net Profit:</strong> ${formatCurrency(finData.profit)}<br>`;
      finHtml += `<strong>Profit Margin:</strong> ${finData.margin}%<br><br>`;
      
      if (finData.growth) {
        finHtml += `📈 <strong>+${finData.growth}%</strong> compared to last month<br><br>`;
      }
      
      finHtml += `<em>Performance is strong. Would you like a detailed breakdown?</em>`;
      
      return {
        text: finHtml,
        quickReplies: ['Expense breakdown', 'Revenue by category', 'Quarterly report']
      };
    
    case 'financial_quarterly':
      const q3Data = FINANCIAL_DATA.q3_2025;
      let q3Html = `<strong>💼 Q3 2025 Financial Report</strong><br><br>`;
      q3Html += `<strong>Total Revenue:</strong> ${formatCurrency(q3Data.revenue)}<br>`;
      q3Html += `<strong>Total Expenses:</strong> ${formatCurrency(q3Data.expenses)}<br>`;
      q3Html += `<strong>Net Profit:</strong> ${formatCurrency(q3Data.profit)}<br>`;
      q3Html += `<strong>Profit Margin:</strong> ${q3Data.margin}%<br><br>`;
      q3Html += `<em>Quarterly performance shows consistent growth across all metrics.</em>`;
      
      return {
        text: q3Html,
        quickReplies: ['Year-to-date report', 'Budget comparison', 'Forecast Q4']
      };
    
    case 'employee_general':
      let empHtml = `<strong>👥 Employee Directory</strong><br><br>`;
      empHtml += `<strong>Total Employees:</strong> ${EMPLOYEES.length}<br><br>`;
      EMPLOYEES.forEach(emp => {
        empHtml += `• <strong>${emp.name}</strong> (${emp.id})<br>`;
        empHtml += `&nbsp;&nbsp;${emp.position} - ${emp.department}<br>`;
        empHtml += `&nbsp;&nbsp;Leave Balance: ${emp.leave_balance} days<br><br>`;
      });
      
      return {
        text: empHtml,
        quickReplies: ['Search employee', 'Department breakdown', 'Leave summary']
      };
    
    case 'employee_specific':
      const emp = intent.employee;
      let empDetailHtml = `<strong>👤 Employee Profile</strong><br><br>`;
      empDetailHtml += `<strong>Name:</strong> ${emp.name}<br>`;
      empDetailHtml += `<strong>Employee ID:</strong> ${emp.id}<br>`;
      empDetailHtml += `<strong>Department:</strong> ${emp.department}<br>`;
      empDetailHtml += `<strong>Position:</strong> ${emp.position}<br>`;
      empDetailHtml += `<strong>Leave Balance:</strong> ${emp.leave_balance} days<br><br>`;
      empDetailHtml += `<em>All information is current as of today.</em>`;
      
      return {
        text: empDetailHtml,
        quickReplies: ['View attendance', 'Payroll info', 'Performance review']
      };
    
    case 'report':
      let reportHtml = `<strong>📊 Report Generation</strong><br><br>`;
      reportHtml += `I can generate the following reports:<br><br>`;
      reportHtml += `• <strong>Sales Report:</strong> Revenue and sales analytics<br>`;
      reportHtml += `• <strong>Inventory Report:</strong> Stock levels and movements<br>`;
      reportHtml += `• <strong>Financial Statement:</strong> P&amp;L and balance sheet<br>`;
      reportHtml += `• <strong>Employee Report:</strong> HR analytics and metrics<br>`;
      reportHtml += `• <strong>Custom Report:</strong> Define your own parameters<br><br>`;
      reportHtml += `Which report would you like to generate?`;
      
      return {
        text: reportHtml,
        quickReplies: ['Sales report', 'Inventory report', 'Financial statement']
      };
    
    case 'system_status':
      let statusHtml = `<strong>⚙️ System Status</strong><br><br>`;
      statusHtml += `<span class="status-badge success">✅ All Systems Operational</span><br><br>`;
      statusHtml += `<strong>Database:</strong> Online<br>`;
      statusHtml += `<strong>API Services:</strong> Running<br>`;
      statusHtml += `<strong>Backup Status:</strong> Last backup 2 hours ago<br>`;
      statusHtml += `<strong>Active Users:</strong> 247<br>`;
      statusHtml += `<strong>Response Time:</strong> 45ms (Excellent)<br><br>`;
      statusHtml += `<em>System health is optimal. No issues detected.</em>`;
      
      return {
        text: statusHtml,
        quickReplies: ['View logs', 'Performance metrics', 'Scheduled maintenance']
      };
    
    default:
      return {
        text: `I'm not sure I understood that. I can help you with:<br><br>
        • Inventory and stock management<br>
        • Order tracking<br>
        • Financial reports<br>
        • Employee information<br>
        • System reports<br><br>
        Try asking something like "Check inventory" or "Track order 12345"`,
        quickReplies: ['Check inventory', 'View orders', 'Help']
      };
  }
}

// User Input Handler
function handleUserInput(userMessage) {
  if (!userMessage.trim()) return;
  
  // Add user message
  addMessage(userMessage, true);
  
  // Update recent queries
  updateRecentQueries(userMessage);
  
  // Clear input
  chatInput.value = '';
  
  // Show typing indicator
  showTypingIndicator();
  
  // Simulate processing delay
  setTimeout(() => {
    hideTypingIndicator();
    
    // Detect intent and generate response
    const intent = detectIntent(userMessage);
    const response = generateResponse(intent);
    
    // Add bot message
    addMessage(response.text, false, response.quickReplies);
    
    // Update context
    conversationContext.lastTopic = intent.type;
    conversationContext.lastQuery = userMessage;
  }, 1500);
}

// Recent Queries Management
function updateRecentQueries(query) {
  conversationContext.recentQueries.unshift(query);
  if (conversationContext.recentQueries.length > 5) {
    conversationContext.recentQueries.pop();
  }
  renderRecentQueries();
}

function renderRecentQueries() {
  if (conversationContext.recentQueries.length === 0) {
    recentQueriesContainer.innerHTML = '<p class="empty-state">No recent queries</p>';
    return;
  }
  
  recentQueriesContainer.innerHTML = '';
  conversationContext.recentQueries.forEach(query => {
    const queryDiv = document.createElement('div');
    queryDiv.className = 'recent-query-item';
    queryDiv.textContent = query;
    queryDiv.onclick = () => handleUserInput(query);
    recentQueriesContainer.appendChild(queryDiv);
  });
}

// Event Listeners
sendBtn.addEventListener('click', () => {
  handleUserInput(chatInput.value);
});

chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    handleUserInput(chatInput.value);
  }
});

// Quick Action Buttons
document.querySelectorAll('.quick-action-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const query = btn.getAttribute('data-query');
    handleUserInput(query);
  });
});

// Module Items
document.querySelectorAll('.module-item').forEach(item => {
  item.addEventListener('click', () => {
    const module = item.getAttribute('data-module');
    let query = '';
    switch(module) {
      case 'inventory': query = 'Show inventory overview'; break;
      case 'sales': query = 'Show sales summary'; break;
      case 'finance': query = 'Financial summary'; break;
      case 'hr': query = 'Show employee information'; break;
      case 'procurement': query = 'Show low stock items'; break;
    }
    handleUserInput(query);
  });
});

// Initial Welcome Message
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const welcomeMessage = `<strong>Welcome to ERP Assistant! 👋</strong><br><br>
    I'm your intelligent assistant for managing your ERP system. I can help you with:<br><br>
    • 📦 <strong>Inventory Management:</strong> Check stock levels, track products, and manage suppliers<br>
    • 🚚 <strong>Order Tracking:</strong> Monitor shipments and delivery status<br>
    • 💰 <strong>Financial Reports:</strong> Revenue, expenses, and profit analysis<br>
    • 👥 <strong>Employee Information:</strong> HR data and personnel management<br>
    • 📊 <strong>Custom Reports:</strong> Generate detailed analytics<br><br>
    <em>How can I assist you today?</em>`;
    
    addMessage(welcomeMessage, false, ['Check inventory', 'Track orders', 'Financial summary']);
  }, 500);
});
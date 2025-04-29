import { Item, Request, User } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'requester',
    department: 'Engineering'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'admin',
    department: 'Operations'
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'manager',
    department: 'Engineering'
  }
];

export const mockItems: Item[] = [
  {
    id: '1',
    name: 'Arduino Uno',
    description: 'Microcontroller board based on the ATmega328P',
    totalStock: 20,
    availableStock: 15,
    reservedStock: 5,
    lowStockThreshold: 5,
    category: 'Electronics'
  },
  {
    id: '2',
    name: 'Raspberry Pi 4',
    description: 'Single-board computer with 4GB RAM',
    totalStock: 10,
    availableStock: 3,
    reservedStock: 7,
    lowStockThreshold: 3,
    category: 'Electronics'
  },
  {
    id: '3',
    name: 'Soldering Iron',
    description: 'Temperature controlled soldering iron',
    totalStock: 15,
    availableStock: 10,
    reservedStock: 5,
    lowStockThreshold: 3,
    category: 'Tools'
  },
  {
    id: '4',
    name: 'Breadboard',
    description: 'Solderless breadboard for prototyping',
    totalStock: 30,
    availableStock: 20,
    reservedStock: 10,
    lowStockThreshold: 8,
    category: 'Electronics'
  },
  {
    id: '5',
    name: 'Oscilloscope',
    description: 'Digital oscilloscope for signal analysis',
    totalStock: 5,
    availableStock: 2,
    reservedStock: 3,
    lowStockThreshold: 2,
    category: 'Equipment'
  }
];

export const mockRequests: Request[] = [
  {
    id: '1',
    projectName: 'Smart Home Prototype',
    requester: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com'
    },
    items: [
      { itemId: '1', itemName: 'Arduino Uno', quantity: 2 },
      { itemId: '4', itemName: 'Breadboard', quantity: 3 }
    ],
    reason: 'Building a smart home automation prototype for the senior design project',
    priority: 'high',
    dueDate: new Date('2025-05-15'),
    status: 'pending',
    createdAt: new Date('2025-04-01'),
    updatedAt: new Date('2025-04-01')
  },
  {
    id: '2',
    projectName: 'Weather Station',
    requester: {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com'
    },
    items: [
      { itemId: '2', itemName: 'Raspberry Pi 4', quantity: 1 },
      { itemId: '3', itemName: 'Soldering Iron', quantity: 1 }
    ],
    reason: 'Creating a weather monitoring station for the campus',
    priority: 'medium',
    dueDate: new Date('2025-05-20'),
    status: 'approved',
    createdAt: new Date('2025-03-25'),
    updatedAt: new Date('2025-03-27'),
    pickupDetails: {
      location: 'Room 302',
      time: new Date('2025-04-05T14:00:00'),
      delivered: false
    }
  },
  {
    id: '3',
    projectName: 'Signal Analyzer',
    requester: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com'
    },
    items: [
      { itemId: '5', itemName: 'Oscilloscope', quantity: 1 }
    ],
    reason: 'Analyzing signal patterns for the communications project',
    priority: 'low',
    status: 'fulfilled',
    createdAt: new Date('2025-03-10'),
    updatedAt: new Date('2025-03-15'),
    pickupDetails: {
      location: 'Lab 101',
      time: new Date('2025-03-17T10:00:00'),
      delivered: true
    }
  },
  {
    id: '4',
    projectName: 'LED Matrix Display',
    requester: {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com'
    },
    items: [
      { itemId: '1', itemName: 'Arduino Uno', quantity: 1 },
      { itemId: '4', itemName: 'Breadboard', quantity: 2 }
    ],
    reason: 'Building an LED matrix display for the department showcase',
    priority: 'high',
    dueDate: new Date('2025-04-25'),
    status: 'denied',
    createdAt: new Date('2025-04-05'),
    updatedAt: new Date('2025-04-06')
  }
];
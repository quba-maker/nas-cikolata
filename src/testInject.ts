import { defaultState } from './data/seedData';
export const injectTestData = () => {
  localStorage.setItem('nas_cikolata_v4', JSON.stringify({
    ...defaultState,
    orders: [
      { id: '1', status: 'onay', totalPrice: 1000, createdAt: new Date().toISOString(), deliveryDate: new Date().toISOString(), bride: 'Ayse', groom: 'Ali', categoryName: 'Set' },
      { id: '2', status: 'hazirlaniyor', totalPrice: 2000, createdAt: new Date().toISOString(), deliveryDate: new Date().toISOString(), bride: 'Fatma', groom: 'Mehmet', categoryName: 'Set' }
    ]
  }));
};

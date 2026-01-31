// assets
import {
  AppstoreAddOutlined,
  AntDesignOutlined,
  BarcodeOutlined,
  BgColorsOutlined,
  FontSizeOutlined,
  LoadingOutlined,
  PlusOutlined,
  MinusOutlined,
  CalculatorOutlined,
  LineChartOutlined
} from '@ant-design/icons';

// icons
const icons = {
  FontSizeOutlined,
  BgColorsOutlined,
  BarcodeOutlined,
  AntDesignOutlined,
  LoadingOutlined,
  AppstoreAddOutlined,
  MinusOutlined,
  PlusOutlined,
  CalculatorOutlined,
  LineChartOutlined
};

// ==============================|| MENU ITEMS - UTILITIES ||============================== //

const utilities = {
  id: 'utilities',
  title: 'Utilities',
  type: 'group',
  children: [
    {
      id: 'util-typography',
      title: 'Typography',
      type: 'item',
      url: '/typography',
      icon: icons.FontSizeOutlined
    },
    {
      id: 'util-color',
      title: 'Newsletter',
      type: 'item',
      url: '/color',
      icon: icons.BgColorsOutlined
    },
    {
      id: 'util-shadow',
      title: 'Books',
      type: 'item',
      url: '/shadow',
      icon: icons.BarcodeOutlined
    },
    {
      id: 'util-add',
      title: 'Add Stock',
      type: 'item',
      url: '/add_stock',
      icon: icons.PlusOutlined
    },
    {
      id: 'util-calculator',
      title: 'Stock Calculator',
      type: 'item',
      url: '/stock_calculator',
      icon: icons.CalculatorOutlined
    },
    {
      id: 'util-market-ticker',
      title: 'Market Ticker',
      type: 'item',
      url: '/market-ticker',
      icon: icons.LineChartOutlined
    },
    {
      id: 'util-remove',
      title: 'Remove Stock',
      type: 'item',
      url: '/remove_stock',
      icon: icons.MinusOutlined
    }
  ]
};

export default utilities;

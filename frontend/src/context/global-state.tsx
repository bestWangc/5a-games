import React, { createContext, useReducer, useContext, ReactNode, Dispatch } from 'react';

// 定义状态类型
interface State {
   userAddress: string,
   userHeroNFT:Array<number>,
}

// 定义动作类型
type Action =
  | { type: 'SET_USER_ADDRESS'; payload: string }
  | { type: 'SET_USER_HERO_NFT'; payload: Array<number> };

// 定义初始状态
const initialState: State = {
    userAddress: "",
    userHeroNFT: [],
};

// 定义 reducer 函数
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_USER_ADDRESS':
      return {
        ...state,
        userAddress: action.payload,
      };
    case 'SET_USER_HERO_NFT':
      return {
        ...state,
        userHeroNFT: action.payload,
      };
    default:
      return state;
  }
};

// 创建 context
const GlobalStateContext = createContext<{
  state: State;
  dispatch: Dispatch<Action>;
} | undefined>(undefined);

// 创建全局状态提供者组件
interface GlobalStateProviderProps {
  children: ReactNode;
}

export const GlobalStateProvider: React.FC<GlobalStateProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <GlobalStateContext.Provider value={{ state, dispatch }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

// 创建一个自定义 hook 来访问全局状态
export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
};

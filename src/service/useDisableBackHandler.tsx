
import { useEffect } from 'react';
import { BackHandler } from 'react-native';

export const useDisableBackHandler = (enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const backAction = () => true; // disables back

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [enabled]);
};

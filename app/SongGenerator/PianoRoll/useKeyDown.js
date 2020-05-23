import { useEffect, useState } from 'react';

const useKeyDown = () => {
  const [keysDown, setKeysDown] = useState({});
  const onKeyDown = e => {
    e.preventDefault();
    if (!keysDown[e.key]) {
      setKeysDown({ ...keysDown, [e.key]: true });
    }
  };
  const onKeyUp = e => {
    e.preventDefault();
    if (e.key === 'Meta') {
      setKeysDown({});
    } else {
      setKeysDown({ ...keysDown, [e.key]: false });
    }
  };
  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  });
  return keysDown;
};

export default useKeyDown;

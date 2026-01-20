import '@testing-library/dom';
import type { FireFunction, FireObject } from '@testing-library/dom';

declare module '@testing-library/dom' {
  export const fireEvent: FireFunction &
    FireObject & {
      press: FireObject['click'];
    };
}

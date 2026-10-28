import { useEffect } from 'react';

/** F6. Đặt tiêu đề tab: "Dell XPS 13 | LaptopStore" */
export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | LaptopStore` : 'LaptopStore';
  }, [title]);
}

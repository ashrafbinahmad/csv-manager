import { routes } from 'wasp/client/router';
import { User } from 'wasp/entities';

type ContentSection = {
  title: string;
  items: {
    title: string;
    path: string;
    icon: string;
    show: boolean;
  }[];
};

export const getContentSections = (user: User | null): ContentSection[] => {
  const isLoggedIn = !!user;

  return [
    {
      title: 'Main',
      items: [
        {
          title: 'Dashboard',
          path: routes.DashboardPageRoute.to,
          icon: 'LayoutDashboard',
          show: isLoggedIn
        },
        {
          title: 'CSV Files',
          path: routes.CsvFilesRoute.to,
          icon: 'FileSpreadsheet',
          show: isLoggedIn
        },
        {
          title: 'Batch Types',
          path: routes.BatchTypesPageRoute.to,
          icon: 'List',
          show: isLoggedIn
        }
      ]
    }
  ];
};

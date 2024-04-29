import { HeaderI } from './enums_constants';


export function headerFromColumnSettings(feTableSettings: any): HeaderI[] {
  const headerSettings: Record<string, Object> = feTableSettings?.sessionSettings?.setting_members?.settings;
  const headerOrder: string[] = feTableSettings?.sessionSettings?.setting_members?.ordering;
  const headerArray: HeaderI[] = [];
  if (headerSettings && headerOrder) {
    headerOrder.forEach((key) => {
      if (headerSettings.hasOwnProperty(key) &&
        headerSettings[key]['upload_download']) {
        const columnSetting = headerSettings[key];
        if (columnSetting['upload_download']) {
          const headerName = `${columnSetting['main']}` +
            (columnSetting['sub'] ? ` ${columnSetting['sub']}` : ``);
          headerArray.push({
            header: headerName,
            key: key,
            width: headerName.length < 10 ? 10 : Math.min(headerName.length, 15),
          });
        }
      }
    });
  } else {
    throw new Error('No header settings found');
  }
  return headerArray;
}

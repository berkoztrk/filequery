import filequery from './index';


(async () => {
  const files = await filequery.query({
    directory: '/media/berk/Elements/movies',
    isRecursive: true,
    returnFolders: false,
    sizeQuery: '$lt 1 $GB',
    fileType: filequery.FileTypeOptions.video,
  });
  console.dir(files);
})();

# filequery
file query utility for nodejs

## Installation
``
    npm i filequery
``

## Options
```
  {
    directory: 'C:/Project',              // Parent directory. Query returns files starting this directory. REQUIRED.
    fileType : fq.FileTypeOptions.video,  // Currently only supports video and image. If video is selected returns video files
    isRecursive: true,                    // Should query search subfolders of parent directory. DEFAULT: false
    returnFolders: true,                  // Should query return folders with files. DEFAULT: true
    includeBaseDirectoryOnReturn: true,   // Should return path values start with directory string. DEFAULT: true
    extension: '.pdf',                    // Filter file extensions. Only returns pdf files. DEFAULT: '*'
    sizeQuery: '$gt 1 $BYTE'              // Size query. This example returns files that size greater than 1 BYTE.  
  }
```
### Size query format
#### Query formats
```
  // Only these operators supported. Greater than, equals and less than.
  const OPERATORS = {
    GT: '$gt',
    EQ: '$eq',
    LT: '$lt',
  };
  // Only these file size types supported.
  const SIZE_TYPES = {
    BYTE: '$BYTE',
    KB: '$KB',
    MB: '$MB',
    GB: '$GB',
  };

```
#### Query syntax
Query syntax should follow like `OPERATOR AMOUNT FILE_SIZE_TYPE'. Each token should seperated with 1 whitespace character.  

#### Example queries
```
  sizeQuery : '$gt 1 $MB' // Returns file size greater than 1 MB files.
  sizeQuery : '$eq 1 $GB' // Returns file size equals 1 Gigabyte files.
  sizeQuery : '$lt 10 $KB'// Returns file size less than 10 Kilobytes files.
```


## Example Usage

```
    const fq = require("filequery");

    (async() => {
      // This query returns javascript files with size greater than 1 Kilobytes.
      // Only searches directory and doesn't includes subfolders.
      // No folders will be on resultset
      const result = await fq.query({
        directory: 'C:/Project',              // Query directory
        extension: '.js',                     // Only javascript files
        isRecursive: false,                   // Don't search subfolders
        includeBaseDirectoryOnReturn: false,  // Don't include directory path on result paths. 
        returnFolders: false,                 // Only return files. Can be blank because extension property is provided.
        sizeQuery: '$gt 1 $KB'                // Return only files that size greater than 1 Kilobytes.
      });
    })();

```
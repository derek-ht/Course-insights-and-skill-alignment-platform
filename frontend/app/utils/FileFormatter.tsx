export const convertBase64 = (file: File): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      const res = reader.result as string;
      const data: string = res.replace(
        /^data:application\/?[A-z]*;base64,/,
        ""
      );
      resolve(data);
    };

    reader.onerror = () => {
      reject([]);
    };
  });
};

export async function tobase64Handler(files: FileList): Promise<string[]> {
  const filePathsPromises = [];
  for (var i = 0; i < files.length; i++) {
    filePathsPromises.push(convertBase64(files[i]));
  }
  return await Promise.all(filePathsPromises);
}

$files = Get-ChildItem -Path src\main\java -Recurse -Filter *.java | Select-Object -ExpandProperty FullName
mkdir -Force target/classes | Out-Null
javac -d target/classes $files 2> javac_errors.txt
Get-Content javac_errors.txt

import styled from "styled-components";
import { useDropzone } from "react-dropzone";
import { BLACK } from "../constants";

const Dropzone = ({ onDrop, accept }: IProps) => {
    // Initializing useDropzone hooks with options
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: accept as any,
      maxFiles: 1,
    multiple: false,

    });
  
    return (
      <Container {...getRootProps()} active>
        <input {...getInputProps()} />
          {isDragActive ? (
            <p>Release to drop the fingerprint.zip here</p>
          ) : (
            <p>
              Drag and drop your fingerprint.zip here
            </p>
          )}
      </Container>
    );
};

interface IProps {
  onDrop: (acceptedFiles: File[]) => void;
  accept: string[]
}

const Container = styled.div<any>`
    p {
        color: ${BLACK};
        font-size:12px;
        font-family: 'Roboto', sans-serif;
    }

    cursor:pointer ;
    display: flex;
    align-items:center ;
    justify-content:center ;
    width: 100%;
    height: 70px;
    background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='%23353535FF' stroke-width='2' stroke-dasharray='6%2c 6' stroke-dashoffset='23' stroke-linecap='square'/%3e%3c/svg%3e");
`  

export default Dropzone
import { gql } from '@apollo/client';

export const CREATE_PRODUCT_REQUEST_MUTATION = gql`
  mutation CreateProductRequest($input: CreateProductRequestInput!) {
    createProductRequest(input: $input) {
      id
      clientDocNumber
      clientName
      productType
      status
      createdAt
    }
  }
`;

export const UPDATE_PRODUCT_REQUEST_STATUS_MUTATION = gql`
  mutation UpdateProductRequestStatus($id: ID!, $input: UpdateProductRequestStatusInput!) {
    updateProductRequestStatus(id: $id, input: $input) {
      id
      status
    }
  }
`;

export const PRODUCT_REQUESTS_QUERY = gql`
  query ProductRequests($clientDocNumber: String!) {
    productRequests(clientDocNumber: $clientDocNumber) {
      id
      productType
      status
      createdAt
    }
  }
`;

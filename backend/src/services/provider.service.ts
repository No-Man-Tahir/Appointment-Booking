import {
  findProviders,
} from "../repository/provider.repository";

export async function getProviders() {
  return findProviders();
}
import React, { useEffect, useState } from "react";
import "./UserList.css";
import { PageMenu } from "../../components/pageMenu/PageMenu";
import { UserStats } from "../../components/userStats/UserStats";
import { Search } from "../../components/search/Search";
import { FaTrashAlt } from "react-icons/fa";
import { ChangeRole } from "../../components/changeRole/ChangeRole";
import { useDispatch, useSelector } from "react-redux";
import { useRedirectLoggedOutUser } from "../../customHook/useRedirectLoggedOutUser";
import { deleteUser, getUsers } from "../../redux/features/auth/authSlice";
import { shortenText } from "../profile/Profile";
import { Spinner } from "../../components/loader/Loader";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import {
  FILTER_USERS,
  selectUsers,
} from "../../redux/features/auth/filterSlice";
import { saveAs } from "file-saver";
import {
  PDFViewer,
  Document,
  Page,
  pdf,
  Text,
  Image,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { BiDownload } from "react-icons/bi";

export const UserList = () => {
  useRedirectLoggedOutUser("/login");
  const dispatch = useDispatch();

  const [search, setSearch] = useState("");

  const { users, isLoading } = useSelector((state) => state.auth);

  const filteredUsers = useSelector(selectUsers);

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  const removeUser = async (id) => {
    await dispatch(deleteUser(id));
    dispatch(getUsers());
  };

  const handlePDFDownnload = async (id, itemName, status, description) => {
    // Generate PDF content
    const pdfContent = (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <View style={styles.headerSection}>
              <Text style={styles.header}>Inventory Data</Text>
            </View>
            <hr />
            <View style={styles.infoSection}>
              <View style={styles.table}>
                <View style={styles.row}>
                  <View style={styles.colLabel}>
                    <Text style={styles.label}>ID:</Text>
                  </View>
                  <View style={styles.colValue}>
                    <Text style={styles.text}>#{id}</Text>
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={styles.colLabel}>
                    <Text style={styles.label}>Item:</Text>
                  </View>
                  <View style={styles.colValue}>
                    <Text style={styles.text}>{itemName}</Text>
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={styles.colLabel}>
                    <Text style={styles.label}>Status:</Text>
                  </View>
                  <View style={styles.colValue}>
                    <Text style={styles.text}>{status}</Text>
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={styles.colLabel}>
                    <Text style={styles.label}>Description:</Text>
                  </View>
                  <View style={styles.colValue}>
                    <Text style={styles.text}>{description}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Page>
      </Document>
    );

    // Generate PDF blob
    const blob = await pdf(pdfContent).toBlob();

    // Download PDF
    saveAs(blob, `${itemName} Inventory Data.pdf`);
  };

  const confirmDelete = (id) => {
    confirmAlert({
      title: "Delete This User",
      message: "Are you sure to Delete this user?",
      buttons: [
        {
          label: "Delete",
          onClick: () => removeUser(id),
        },
        {
          label: "Cancel",
        },
      ],
    });
  };

  useEffect(() => {
    dispatch(FILTER_USERS({ users, search }));
  }, [dispatch, users, search]);

  return (
    <section className="userList-selection">
      <div className="container">
        <PageMenu />
        <UserStats />
        <div className="user-list">
          {isLoading && <Spinner />}
          <div className="table">
            <div className="--flex-between">
              <span>
                <h3>All Users</h3>
              </span>
              <span>
                <Search
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </span>
            </div>
            {!isLoading && users && users.length === 0 ? (
              <p>No user found...</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>S/n</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Change Role</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users &&
                    filteredUsers.map((user, index) => {
                      const { _id, name, email, role } = user;

                      return (
                        <tr key={_id}>
                          <td>{index + 1}</td>
                          <td>{shortenText(name, 15)}</td>
                          <td>{email}</td>
                          <td>{role}</td>
                          <td>
                            <ChangeRole _id={_id} email={email} />
                          </td>
                          <td>
                            <span>
                              <FaTrashAlt
                                size={20}
                                color="red"
                                onClick={() => confirmDelete(_id)}
                              />
                            </span>
                            <span>
                              <> </>
                              <BiDownload
                                size={20}
                                color="green"
                                onClick={() => {
                                  handlePDFDownnload(_id, name, email, role);
                                }}
                              />
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 60,
    border: "1px solid #000",
  },
  section: {
    marginBottom: 10,
  },
  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 50,
    marginRight: 10,
  },
  header: {
    fontSize: 32,
    fontWeight: "extrabold",
    marginBottom: 10,
  },
  infoSection: {
    marginBottom: 20,
  },
  table: {
    border: "1px solid #000",
  },
  row: {
    flexDirection: "row",
    borderBottom: "1px solid #000",
  },
  colLabel: {
    width: "50%",
    borderRight: "1px solid #000",
    padding: 5,
  },
  colValue: {
    width: "40%",
    padding: 5,
  },
  label: {
    fontWeight: "bold",
  },
  text: {},
});

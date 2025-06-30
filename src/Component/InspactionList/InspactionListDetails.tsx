import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Linking,
  Dimensions,
  ImageBackground,
  Modal,
  TextInput,
  Alert,
  Platform,

} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import apiClient from '../../service/api/apiInterceptors';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useDisableBackHandler } from '../../service/useDisableBackHandler';
import { useNavigation } from '@react-navigation/native';
import { DrawerParamList } from '../../Type/DrawerParam';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Picker } from '@react-native-picker/picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';













type RouteParams = {
  params: {
    id: string;
    locationName: string;
    vendorName: string;

  };
};

const { width } = Dimensions.get('window');

const InspectionListDetails = () => {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();


  useDisableBackHandler(true);
  const route = useRoute<RouteProp<RouteParams, 'params'>>();
  const { id, locationName, vendorName } = route.params;




  const [inspectionData, setInspectionData] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedChawlCode, setSelectedChawlCode] = useState('');
  const [chawlType, setChawltype] = useState('');
  const [editForm, setEditForm] = useState({
    length: '',
    breadth: '',
    height: '',


  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchInspectionDetails = async () => {
      try {
        const response = await apiClient.get(`/api/mobile/InspectionReport/${id}`);
        setInspectionData(response.data);
        console.log('id response', response.data);
        console.log('Inspection Data:', response.data);
      } catch (error) {
        console.error('Error fetching inspection details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInspectionDetails();
  }, [id]);



  const getBase64Logo = async () => {
    const asset = Asset.fromModule(require('../../../assets/logo.png'));
    await asset.downloadAsync(); // Ensure it's loaded
    const base64 = await FileSystem.readAsStringAsync(asset.localUri!, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:image/png;base64,${base64}`;
  };



  // const generatePDF = async () => {

  //    const formattedDate = new Date(inspectionData.createdOn).toLocaleString('en-IN', {
  //    day: 'numeric',
  //      month: 'long',
  //      year: 'numeric',
  //      hour: '2-digit',
  //      minute: '2-digit'
  //    });

  //   if (!inspectionData) {
  //     Alert.alert('Error', 'No inspection data available');
  //     return;
  //   }

  //   try {
  //     // Show loading indicator
  //     Alert.alert('Generating PDF', 'Please wait...');

  //     // Generate the PDF (your existing code)

  //      const htmlContent = `
  //     <html>
  //       <head>
  //         <style>
  //           @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');

  //           body {
  //             font-family: 'Roboto', sans-serif;
  //             color: #333;
  //             line-height: 1.5;
  //             padding: 0;
  //             margin: 0;
  //             background-color: #f9f9f9;
  //           }
  //           .container {
  //             max-width: 800px;
  //             margin: 0 auto;
  //             background: white;
  //             box-shadow: 0 0 20px rgba(0,0,0,0.05);
  //           }
  //           .letterhead {
  //             background: #2c3e50;
  //             color: white;
  //             padding: 30px 40px;
  //             display: flex;
  //             justify-content: space-between;
  //             align-items: center;
  //           }
  //           .company-info {
  //             line-height: 1.4;
  //           }
  //           .company-name {
  //             font-size: 22px;
  //             font-weight: 700;
  //             margin: 0 0 5px 0;
  //           }
  //           .company-tagline {
  //             font-size: 13px;
  //             opacity: 0.8;
  //             margin: 0;
  //           }
  //           .report-title {
  //             text-align: right;
  //           }
  //           .report-main-title {
  //             font-size: 28px;
  //             margin: 0;
  //             font-weight: 300;
  //           }
  //           .report-subtitle {
  //             font-size: 14px;
  //             margin: 5px 0 0 0;
  //             font-weight: 400;
  //           }
  //           .document-body {
  //             padding: 40px;
  //           }
  //           .section {
  //             margin-bottom: 30px;
  //           }
  //           .section-header {
  //             border-bottom: 2px solid #eaeaea;
  //             padding-bottom: 8px;
  //             margin-bottom: 20px;
  //             display: flex;
  //             justify-content: space-between;
  //             align-items: flex-end;
  //           }
  //           .section-title {
  //             font-size: 18px;
  //             font-weight: 500;
  //             color: #2c3e50;
  //             margin: 0;
  //           }
  //           .section-icon {
  //             color: #7f8c8d;
  //             font-size: 14px;
  //           }
  //           .two-column {
  //             display: flex;
  //             flex-wrap: wrap;
  //             gap: 20px;
  //           }
  //           .column {
  //             flex: 1;
  //             min-width: 250px;
  //           }
  //           .info-item {
  //             margin-bottom: 15px;
  //           }
  //           .info-label {
  //             font-size: 13px;
  //             color: #7f8c8d;
  //             margin-bottom: 3px;
  //             font-weight: 500;
  //           }
  //           .info-value {
  //             font-size: 15px;
  //             font-weight: 400;
  //           }
  //           .status {
  //             display: inline-block;
  //             padding: 3px 10px;
  //             border-radius: 4px;
  //             font-size: 12px;
  //             font-weight: 500;
  //             background-color: ${inspectionData.isActive ? '#27ae60' : '#e74c3c'};
  //             color: white;
  //           }
  //           .comments-box {
  //             background: #f8f9fa;
  //             border-left: 4px solid #bdc3c7;
  //             padding: 15px;
  //             font-size: 14px;
  //             line-height: 1.6;
  //           }
  //           .image-gallery {
  //             display: grid;
  //             grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  //             gap: 15px;
  //             margin-top: 15px;
  //           }
  //           .image-container {
  //             border: 1px solid #eaeaea;
  //             padding: 5px;
  //             border-radius: 4px;
  //           }
  //           .footer {
  //             text-align: center;
  //             padding: 20px;
  //             font-size: 11px;
  //             color: #7f8c8d;
  //             border-top: 1px solid #eaeaea;
  //             background: #f8f9fa;
  //           }
  //           .signature-area {
  //             margin-top: 50px;
  //             display: flex;
  //             justify-content: space-between;
  //           }
  //           .signature-line {
  //             width: 200px;
  //             border-top: 1px solid #bdc3c7;
  //             margin-top: 40px;
  //             text-align: center;
  //             padding-top: 5px;
  //             font-size: 12px;
  //           }
  //         </style>
  //       </head>
  //       <body>
  //         <div class="container">
  //           <!-- Letterhead -->
  //           <div class="letterhead">
  //             <div class="company-info">
  //               <div class="company-name">Supply Valid</div>
  //               <div class="company-tagline">Quality Inspection & Procurement Solutions</div>
  //             </div>
  //             <div class="report-title">
  //               <h1 class="report-main-title">INSPECTION REPORT</h1>
  //               <p class="report-subtitle">Document ID: ${inspectionData.id || 'N/A'}</p>
  //             </div>
  //           </div>

  //           <!-- Document Body -->
  //           <div class="document-body">
  //             <!-- Metadata Section -->
  //             <div class="section">
  //               <div class="two-column">
  //                 <div class="column">
  //                   <div class="info-item">
  //                     <div class="info-label">LOCATION</div>
  //                     <div class="info-value">${locationName || 'N/A'}</div>
  //                   </div>
  //                   <div class="info-item">
  //                     <div class="info-label">VENDOR</div>
  //                     <div class="info-value">${vendorName || 'N/A'}</div>
  //                   </div>
  //                 </div>
  //                 <div class="column">
  //                   <div class="info-item">
  //                     <div class="info-label">REPORT DATE</div>
  //                     <div class="info-value">${formattedDate}</div>
  //                   </div>
  //                   <div class="info-item">
  //                     <div class="info-label">STATUS</div>
  //                     <div class="info-value"><span class="status">${inspectionData.isActive ? 'ACTIVE' : 'INACTIVE'}</span></div>
  //                   </div>
  //                 </div>
  //               </div>
  //             </div>

  //             <!-- Procurement Data -->
  //             <div class="section">
  //               <div class="section-header">
  //                 <h2 class="section-title">PROCUREMENT DETAILS</h2>
  //                 <span class="section-icon">Section 1 of 4</span>
  //               </div>
  //               <div class="two-column">
  //                 <div class="column">
  //                   <div class="info-item">
  //                     <div class="info-label">NUMBER OF FARMERS</div>
  //                     <div class="info-value">${inspectionData.noOfFarmers || 'N/A'}</div>
  //                   </div>
  //                   <div class="info-item">
  //                     <div class="info-label">TOTAL PHYSICAL QUANTITY</div>
  //                     <div class="info-value">${inspectionData.totalPhysicalQuantity || 'N/A'}</div>
  //                   </div>
  //                 </div>
  //                 <div class="column">
  //                   <div class="info-item">
  //                     <div class="info-label">TOTAL PROCURED QUANTITY</div>
  //                     <div class="info-value">${inspectionData.totalProcuerQuantity || 'N/A'}</div>
  //                   </div>
  //                   <div class="info-item">
  //                     <div class="info-label">WEIGHMENT SLIPS</div>
  //                     <div class="info-value">${inspectionData.noOfWeighmentSlip || 'N/A'}</div>
  //                   </div>
  //                 </div>
  //               </div>
  //             </div>

  //             <!-- Quality Assessment -->
  //             <div class="section">
  //               <div class="section-header">
  //                 <h2 class="section-title">QUALITY ASSESSMENT</h2>
  //                 <span class="section-icon">Section 2 of 4</span>
  //               </div>
  //               <div class="two-column">
  //                 <div class="column">
  //                   <div class="info-item">
  //                     <div class="info-label">STOCK QUALITY RATING</div>
  //                     <div class="info-value">${inspectionData.qualityOfStock || 'N/A'}</div>
  //                   </div>
  //                 </div>
  //                 <div class="column">
  //                   <div class="info-item">
  //                     <div class="info-label">STAFF BEHAVIOR RATING</div>
  //                     <div class="info-value">${inspectionData.staffBehavior || 'N/A'}</div>
  //                   </div>
  //                 </div>
  //               </div>
  //             </div>

  //             <!-- Comments -->
  //             <div class="section">
  //               <div class="section-header">
  //                 <h2 class="section-title">INSPECTOR COMMENTS</h2>
  //                 <span class="section-icon">Section 3 of 4</span>
  //               </div>
  //               <div class="comments-box">
  //                 ${inspectionData.additionalComments || 'No additional comments were recorded for this inspection.'}
  //               </div>
  //             </div>

  //             <!-- Attachments -->
  //             ${inspectionData.files?.length ? `
  //             <div class="section">
  //               <div class="section-header">
  //                 <h2 class="section-title">ATTACHMENTS</h2>
  //                 <span class="section-icon">Section 4 of 4</span>
  //               </div>
  //               <div class="image-gallery">
  //                 ${inspectionData.files.map(
  //                   (file: string) => `
  //                   <div class="image-container">
  //                     <img src="https://dev-backend-2024.epravaha.com${file}" width="100%" style="display: block;" />
  //                   </div>
  //                   `
  //                 ).join('')}
  //               </div>
  //             </div>
  //             ` : ''}

  //             <!-- Signature Area -->
  //             <div class="signature-area">
  //               <div>
  //                 <div class="signature-line">Inspector's Signature</div>
  //               </div>
  //               <div>
  //                 <div class="signature-line">Authorized Signatory</div>
  //               </div>
  //             </div>
  //           </div>

  //           <!-- Footer -->
  //           <div class="footer">
  //             <p>This document is computer generated and does not require a physical signature • ${new Date().toLocaleDateString()}</p>
  //             <p>© ${new Date().getFullYear()} Agriculture Produce Network. All Rights Reserved.</p>
  //           </div>
  //         </div>
  //       </body>
  //     </html>
  //   `;

  //     const { uri } = await Print.printToFileAsync({
  //       html: htmlContent,
  //       base64: false,
  //       width: 794,
  //       height: 1123,
  //       margins: {
  //         top: 40,
  //         bottom: 40,
  //         left: 40,
  //         right: 40
  //       }
  //     });

  //     // Define PDF filename
  //     const pdfName = `Inspection_Report_${new Date().toISOString().split('T')[0]}.pdf`;

  //     if (Platform.OS === 'android') {
  //       // For Android - use DownloadManager for automatic download
  //       try {
  //         // Create a download request
  //         const downloadResumable = FileSystem.createDownloadResumable(
  //           uri,
  //           FileSystem.documentDirectory + pdfName,
  //           {},
  //           (downloadProgress) => {
  //             const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
  //             console.log(`Download progress: ${progress * 100}%`);
  //           }
  //         );

  //         const downloadResult = await downloadResumable.downloadAsync();
  //         if (!downloadResult || !downloadResult.uri) {
  //           throw new Error('Download failed or returned undefined');
  //         }
  //         // Use Android's DownloadManager to make it appear in notifications
  //         const downloadUri = await FileSystem.getContentUriAsync(downloadResult.uri);
  //         await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
  //           data: downloadUri,
  //           type: 'application/pdf',
  //           flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
  //         });

  //         Alert.alert('Success', 'PDF download started in background');

  //       } catch (androidError) {
  //         console.warn('Android DownloadManager failed:', androidError);
  //         // Fallback to direct share
  //         await Sharing.shareAsync(uri, {
  //           mimeType: 'application/pdf',
  //           dialogTitle: 'Save Inspection Report',
  //           UTI: 'com.adobe.pdf'
  //         });
  //       }
  //     } else {
  //       // For iOS - save to temporary location and share
  //       const newPath = FileSystem.cacheDirectory + pdfName;
  //       await FileSystem.copyAsync({
  //         from: uri,
  //         to: newPath
  //       });

  //       // Automatically open share dialog
  //       await Sharing.shareAsync(newPath, {
  //         mimeType: 'application/pdf',
  //         dialogTitle: 'Save Inspection Report',
  //         UTI: 'com.adobe.pdf'
  //       });
  //     }

  //     // Clean up temporary file
  //     await FileSystem.deleteAsync(uri, { idempotent: true });

  //   } catch (error) {
  //     console.error('PDF download failed:', error);
  //     let errorMessage = 'Unknown error';
  //     if (error instanceof Error) {
  //       errorMessage = error.message;
  //     } else if (typeof error === 'string') {
  //       errorMessage = error;
  //     }
  //     Alert.alert('Error', `Failed to download PDF: ${errorMessage}`);
  //   }
  // };




  const generatePDF = async () => {
    if (!inspectionData) {
      Alert.alert('Error', 'No inspection data available');
      return;
    }

    try {
      const formattedDate = new Date(inspectionData.createdOn).toLocaleString();
      const logoBase64 = await getBase64Logo();

      // Prepare image HTML for each file if they exist
      let imagesHtml = '';
      if (inspectionData.files?.length) {
        imagesHtml = `
          <div class="section">
            <h2 style="font-size: 1.2rem; margin-bottom: 10px;">Attachments (${inspectionData.files.length})</h2>
            <div class="image-grid">
              ${inspectionData.files.map((file: string) => `
                <div class="image-container">
                  <img src="https://dev-backend-2025.epravaha.com${file}" style="width: 100%; height: auto;" />
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      const htmlContent = `
      <html>
        <head>
          <style>
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            
            body {
              font-family: 'Segoe UI', Roboto, sans-serif;
              width: 100%;
              min-height: 100vh;
              padding: 1.5cm;
              color: #333;
              line-height: 1.5;
            }
            
            .document {
              width: 100%;
              max-width: 21cm;
              margin: 0 auto;
              display: flex;
              flex-direction: column;
              gap: 15px;
            }
            
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              padding-bottom: 15px;
              border-bottom: 2px solid #2c3e50;
              margin-bottom: 20px;
            }
            
            .logo {
              height: 1.8cm;
              max-width: 4cm;
              object-fit: contain;
            }
            
            .section {
              width: 100%;
              page-break-inside: avoid;
              margin-bottom: 15px;
            }
            
            .info-table {
              width: 100%;
              border-collapse: collapse;
            }
            
            .info-table td {
              padding: 8px 5px;
              border-bottom: 1px solid #eee;
              vertical-align: top;
            }
            
            .info-label {
              font-weight: 600;
              color: #555;
              width: 40%;
            }
            
            .image-grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
              gap: 10px;
              margin-top: 10px;
            }
            
            .image-container {
              border: 1px solid #ddd;
              padding: 3px;
              border-radius: 3px;
              page-break-inside: avoid;
            }
            
            .image-container img {
              width: 100%;
              height: auto;
              display: block;
              max-height: 200px;
              object-fit: contain;
            }
            
            @media print {
              body {
                padding: 0;
              }
              .document {
                max-width: 100%;
                padding: 1.5cm;
              }
              .no-print {
                display: none !important;
              }
            }
            
            .page-break {
              page-break-after: always;
            }
            
            .footer {
              margin-top: auto;
              padding-top: 15px;
              border-top: 1px solid #eee;
              font-size: 0.8rem;
              color: #777;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="document">
            <div class="header">
              <div>
                <h1 style="margin: 0; font-size: 1.5rem;">Inspection Report</h1>
                <p style="margin-top: 5px; font-size: 0.9rem;">${formattedDate}</p>
              </div>
              <img src="${logoBase64}" class="logo" alt="Company Logo" />
            </div>
            
            <div class="section">
              <h2 style="font-size: 1.2rem; margin-bottom: 10px;">Basic Information</h2>
              <table class="info-table">
                <tr>
                  <td class="info-label">Location Name:</td>
                  <td>${locationName || 'N/A'}</td>
                </tr>
                <tr>
                  <td class="info-label">Vendor Name:</td>
                  <td>${vendorName || 'N/A'}</td>
                </tr>
                <tr>
                  <td class="info-label">Status:</td>
                  <td>
                    <span style="
                      display: inline-block;
                      padding: 2px 8px;
                      border-radius: 3px;
                      background: ${inspectionData.isActive ? '#4CAF50' : '#F44336'};
                      color: white;
                      font-size: 0.9rem;
                    ">
                      ${inspectionData.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              </table>
            </div>
            
            <div class="section">
              <h2 style="font-size: 1.2rem; margin-bottom: 10px;">Procurement Details</h2>
              <table class="info-table">
                <tr>
                  <td class="info-label">No. of Farmers:</td>
                  <td>${inspectionData.noOfFarmers || 'N/A'}</td>
                </tr>
                <tr>
                  <td class="info-label">Physical Quantity:</td>
                  <td>${inspectionData.totalPhysicalQuantity || 'N/A'}</td>
                </tr>
                <tr>
                  <td class="info-label">Procured Quantity:</td>
                  <td>${inspectionData.totalProcuerQuantity || 'N/A'}</td>
                </tr>
                <tr>
                  <td class="info-label">Weighment Slips:</td>
                  <td>${inspectionData.noOfWeighmentSlip || 'N/A'}</td>
                </tr>
              </table>
            </div>
            
            ${inspectionData.chawlSizes?.length ? `
              <div class="section">
                <h2 style="font-size: 1.2rem; margin-bottom: 10px;">Chawl Sizes (${inspectionData.chawlSizes.length})</h2>
                ${inspectionData.chawlSizes.map((chawl: any, index: number) => `
                  <table class="info-table" style="margin-bottom: 10px;">
                    <tr><td class="info-label">Chawl ${index + 1}</td><td></td></tr>
                    <tr><td class="info-label">Type</td><td>${chawl.chawlType || 'N/A'}</td></tr>
                    <tr><td class="info-label">Length</td><td>${chawl.length || 'N/A'}</td></tr>
                    <tr><td class="info-label">Breadth</td><td>${chawl.breadth || 'N/A'}</td></tr>
                    <tr><td class="info-label">Height</td><td>${chawl.height || 'N/A'}</td></tr>
                    <tr><td class="info-label">Quantity</td><td>${chawl.quantity || 'N/A'}</td></tr>
                  </table>
                `).join('')}
              </div>
            ` : ''}

            ${inspectionData.binsSizes?.length ? `
              <div class="section">
                <h2 style="font-size: 1.2rem; margin-bottom: 10px;">Bin Sizes (${inspectionData.binsSizes.length})</h2>
                ${inspectionData.binsSizes.map((bin: any, index: number) => `
                  <table class="info-table" style="margin-bottom: 10px;">
                    <tr><td class="info-label">Bin ${index + 1}</td><td></td></tr>
                    <tr><td class="info-label">Type</td><td>${bin.chawlType || 'N/A'}</td></tr>
                    <tr><td class="info-label">Length</td><td>${bin.length || 'N/A'}</td></tr>
                    <tr><td class="info-label">Breadth</td><td>${bin.breadth || 'N/A'}</td></tr>
                    <tr><td class="info-label">Height</td><td>${bin.height || 'N/A'}</td></tr>
                    <tr><td class="info-label">Quantity</td><td>${bin.quantity || 'N/A'}</td></tr>
                  </table>
                `).join('')}
              </div>
            ` : ''}

            ${imagesHtml}

            <div class="footer">
              <p>Generated on ${new Date().toLocaleDateString()} • © ${new Date().getFullYear()} Supply Valid</p>
            </div>
          </div>
        </body>
      </html>
    `;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
        width: 794,
        height: 1123,
        margins: {
          top: 40,
          bottom: 40,
          left: 40,
          right: 40
        }
      });

      const pdfName = `Inspection_Report_${new Date().toISOString().split('T')[0]}.pdf`;

      if (Platform.OS === 'android') {
        try {
          const downloadsDir = FileSystem.StorageAccessFramework.getUriForDirectoryInRoot('Downloads');
          const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(downloadsDir);

          if (permissions.granted) {
            const pdfContent = await FileSystem.readAsStringAsync(uri, {
              encoding: FileSystem.EncodingType.Base64,
            });

            const newUri = await FileSystem.StorageAccessFramework.createFileAsync(
              permissions.directoryUri,
              pdfName,
              'application/pdf'
            );

            await FileSystem.writeAsStringAsync(newUri, pdfContent, {
              encoding: FileSystem.EncodingType.Base64,
            });

            Alert.alert(
              'Success',
              'PDF downloaded to your Downloads folder',
              [
                { text: 'Open', onPress: () => Sharing.shareAsync(newUri) },
                { text: 'OK' }
              ]
            );
          } else {
            throw new Error('Permission denied');
          }
        } catch (androidError) {
          console.warn('Android direct save failed:', androidError);
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Save Inspection Report',
            UTI: 'com.adobe.pdf'
          });
        }
      } else {
        const newPath = FileSystem.documentDirectory + pdfName;
        await FileSystem.copyAsync({
          from: uri,
          to: newPath
        });

        Alert.alert(
          'Success',
          'PDF ready to save',
          [
            {
              text: 'Save to Files',
              onPress: () => Sharing.shareAsync(newPath, {
                mimeType: 'application/pdf',
                dialogTitle: 'Save Inspection Report',
                UTI: 'com.adobe.pdf'
              })
            },
            { text: 'OK' }
          ]
        );
      }

      await FileSystem.deleteAsync(uri, { idempotent: true });

    } catch (error) {
      console.error('PDF download failed:', error);
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      Alert.alert('Error', `Failed to download PDF: ${errorMessage}`);
    }
  };


  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const openImage = (url: string) => {
    Linking.openURL(`https://dev-backend-2025.epravaha.com${url}`);
  };



  const openEditModal = (chawl: any) => {
    setSelectedChawlCode(chawl.code); // 🔁 Save dynamic code
    setEditForm({
      length: chawl.length.toString(),
      breadth: chawl.breadth.toString(),
      height: chawl.height.toString(),

    });
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setSelectedChawlCode('');
    setEditForm({
      length: '',
      breadth: '',
      height: '',
    });
  };




  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateChawlSize = async () => {
    if (!selectedChawlCode) {
      Alert.alert('Error', 'No Chawl selected');
      return;
    }

    const formData = new FormData();
    formData.append('ChawlType', chawlType);
    formData.append('id', selectedChawlCode.toString());
    formData.append('Length', Number(editForm.length).toString());
    formData.append('Breadth', Number(editForm.breadth).toString());
    formData.append('Height', Number(editForm.height).toString());
    formData.append('EditComment', comment);

    // Debug logs
    console.log('--- FormData ---');
    console.log('ChawlType:', 'Chawl');
    console.log('id:', selectedChawlCode.toString());
    console.log('Lenght:', Number(editForm.length).toString());
    console.log('Breadth:', Number(editForm.breadth).toString());
    console.log('Height:', Number(editForm.height).toString());
    console.log('EditComment', comment);

    const apiUrl = `/api/InspectionReport/update/${selectedChawlCode}/ChawlSize`;

    try {
      const response = await apiClient.put(apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Success', 'Chawl size updated successfully');
      setEditForm({ length: '', breadth: '', height: '' });
      setComment('');
      setSelectedChawlCode('');

      // ✅ Close modal
      setEditModalVisible(false);

      // Refresh the inspection data
      const refreshResponse = await apiClient.get(`/api/InspectionReport/${id}`);
      setInspectionData(refreshResponse.data);
    } catch (error: any) {
      console.error('Error updating chawl:', error?.response?.data || error.message);
      Alert.alert('Error', 'Failed to update chawl size');
    }
  };





  if (loading) {
    return (

      <ActivityIndicator size="large" color="#4e8cff" />

    );
  }

  if (!inspectionData) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContent}>
          <Text style={styles.errorTitle}>No data found for ID: {id}</Text>
          <Icon name="error-outline" size={40} color="#dc3545" />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header with solid color background */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('InspectionList')}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inspection Report</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: '#4CAF50' }]}>
          <Icon name="people" size={24} color="white" />
          <Text style={styles.summaryNumber}>{inspectionData.noOfFarmers}</Text>
          <Text style={styles.summaryLabel}>Farmers</Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: '#2196F3' }]}>
          <Icon name="scale" size={24} color="white" />
          <Text style={styles.summaryNumber}>{inspectionData.totalPhysicalQuantity}</Text>
          <Text style={styles.summaryLabel}>Physical Qty</Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: '#FF9800' }]}>
          <Icon name="shopping-cart" size={24} color="white" />
          <Text style={styles.summaryNumber}>{inspectionData.totalProcuerQuantity}</Text>
          <Text style={styles.summaryLabel}>Procured Qty</Text>
        </View>
      </View>

      {/* Inspection Details */}
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection('details')}
        activeOpacity={0.8}
      >
        <Text style={styles.sectionTitle}>Inspection Details</Text>
        <Icon
          name={expandedSection === 'details' ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={24}
          color="#495057"
        />
      </TouchableOpacity>

      {expandedSection === 'details' && (
        <View style={styles.detailsContainer}>
          <DetailRow icon="assignment" label="Weighment Slips" value={inspectionData.noOfWeighmentSlip} />
          <DetailRow icon="star" label="Quality of Stock" value={inspectionData.qualityOfStock} />
          <DetailRow icon="mood" label="Staff Behavior" value={inspectionData.staffBehavior} />
          <DetailRow icon="comment" label="Comments" value={inspectionData.additionalComments} />
        </View>
      )}

      {/* Chawl Sizes */}
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection('chawl')}
        activeOpacity={0.8}
      >
        <Text style={styles.sectionTitle}>Chawl Sizes ({inspectionData.chawlSizes?.length || 0})</Text>
        <Icon
          name={expandedSection === 'chawl' ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={24}
          color="#495057"
        />
      </TouchableOpacity>

      {expandedSection === 'chawl' && inspectionData.chawlSizes?.map((chawl: any, index: number) => (
        <View key={chawl.code} style={styles.dataCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Chawl {index + 1}</Text>
            <TouchableOpacity
              onPress={() => openEditModal(chawl)}
              style={styles.editButton}
            >
              <Icon name="edit" size={18} color="#4e8cff" />
            </TouchableOpacity>
          </View>
          <View style={styles.cardRow}>
            <DetailItem icon="straighten" label="Type" value={chawl.chawlType} />
            <DetailItem icon="height" label="Length" value={chawl.length} />
          </View>
          <View style={styles.cardRow}>
            <DetailItem icon="width-full" label="Breadth" value={chawl.breadth} />
            <DetailItem icon="height" label="Height" value={chawl.height} />
          </View>
          <DetailItem icon="layers" label="Quantity" value={chawl.quantity} />
        </View>
      ))}

      {/* Bin Sizes */}
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection('bin')}
        activeOpacity={0.8}
      >
        <Text style={styles.sectionTitle}>Bin Sizes ({inspectionData.binsSizes?.length || 0})</Text>
        <Icon
          name={expandedSection === 'bin' ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={24}
          color="#495057"
        />
      </TouchableOpacity>

      {expandedSection === 'bin' && inspectionData.binsSizes?.map((bin: any, index: number) => (

        <View key={index} style={styles.dataCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Bin {index + 1}</Text>
            <TouchableOpacity
              onPress={() => openEditModal(bin)}
              style={styles.editButton}
            >
              <Icon name="edit" size={18} color="#4e8cff" />
            </TouchableOpacity>
          </View>
          <View style={styles.cardRow}>
            <DetailItem icon="straighten" label="Type" value={bin.chawlType} />
            <DetailItem icon="height" label="Length" value={bin.length} />
          </View>
          <View style={styles.cardRow}>
            <DetailItem icon="width-full" label="Breadth" value={bin.breadth} />
            <DetailItem icon="height" label="Height" value={bin.height} />
          </View>
          <DetailItem icon="layers" label="Quantity" value={bin.quantity} />
        </View>
      ))}

      {/* Files */}
      {/* <TouchableOpacity 
        style={styles.sectionHeader} 
        onPress={() => toggleSection('files')}
        activeOpacity={0.8}
      >
        <Text style={styles.sectionTitle}>Attachments ({inspectionData.files?.length || 0})</Text>
        <Icon 
          name={expandedSection === 'files' ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
          size={24} 
          color="#495057" 
        />
      </TouchableOpacity>

      {expandedSection === 'files' && (
        <View style={styles.imagesContainer}>
          {inspectionData.files?.map((file: string, index: number) => (
            <TouchableOpacity 
              key={index} 
              onPress={() => openImage(file)}
              activeOpacity={0.7}
            >
              <ImageBackground
                source={{ uri: `https://dev-backend-2025.epravaha.com${file}` }}
                style={styles.image}
                resizeMode="cover"
              >
                <View style={styles.imageOverlay}>
                  <Icon name="zoom-in" size={24} color="white" />
                </View>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </View>
      )} */}



      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection('files')}
        activeOpacity={0.8}
      >
        <Text style={styles.sectionTitle}>Attachments ({inspectionData.files?.length || 0})</Text>
        <Icon
          name={expandedSection === 'files' ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={24}
          color="#495057"
        />
      </TouchableOpacity>

      {/* {expandedSection === 'files' && (
  <View style={styles.imagesContainer}>
    {inspectionData.files?.map((file: string, index: number) => (
      <Image
        key={index}
        source={{ uri: `https://dev-backend-2025.epravaha.com${file}` }}
        style={styles.image}
        resizeMode="cover"
      />
    ))}
  </View>
)} */}


      {expandedSection === 'files' && (
        <View style={styles.imagesContainer}>
          {inspectionData.files?.map((file: string, index: number) => (
            <TouchableOpacity
              key={index}
              onPress={() => console.log("Image clicked")} // Optional: Add action later
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: `https://dev-backend-2025.epravaha.com${file}` }}
                style={styles.image}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Chawl Size</Text>
              <TouchableOpacity onPress={closeEditModal}>
                <Icon name="close" size={24} color="#495057" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Chawl Type</Text>
                <Picker
                  selectedValue={chawlType}
                  style={styles.dropdown}
                  onValueChange={(itemValue) => setChawltype(itemValue)}>
                  <Picker.Item label="Select Chawl Type" value="" />
                  <Picker.Item label="None" value="None" />
                  <Picker.Item label="Chawl" value="Chawl" />
                  <Picker.Item label="Bin" value="Bin" />

                  {/* Add more types as needed */}
                </Picker>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Length</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.length}
                  onChangeText={(text) => {
                    handleInputChange('length', text);
                    console.log('Length:', text);
                  }}
                  keyboardType="numeric"
                  placeholder="Enter length"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Breadth</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.breadth}
                  onChangeText={(text) => handleInputChange('breadth', text)}
                  keyboardType="numeric"
                  placeholder="Enter breadth"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Height</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.height}
                  onChangeText={(text) => handleInputChange('height', text)}
                  keyboardType="numeric"
                  placeholder="Enter height"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Comments</Text>
                <TextInput
                  style={styles.input}
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Enter Comments"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeEditModal}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={updateChawlSize}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        onPress={generatePDF}
        style={{ position: 'absolute', top: 40, right: 20, flexDirection: 'row', alignItems: 'center' }}
      >
        <Text style={{ marginRight: 5, color: 'white' }}>Download </Text>
        <Icon name="download" size={24} color="white" />
      </TouchableOpacity>
    </ScrollView>
  );
};

const DetailRow = ({ icon, label, value }: { icon: string, label: string, value: string | number }) => (
  <View style={styles.detailRow}>
    <Icon name={icon} size={20} color="#6c757d" style={styles.detailIcon} />
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue}>{value || 'N/A'}</Text>
  </View>
);

const DetailItem = ({ icon, label, value }: { icon: string, label: string, value: string | number }) => (
  <View style={styles.detailItem}>
    <Icon name={icon} size={16} color="#6c757d" style={styles.itemIcon} />
    <Text style={styles.itemLabel}>{label}:</Text>
    <Text style={styles.itemValue}>{value || '-'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loaderContent: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#495057',
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 20,
    elevation: 3,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#dc3545',
  },
  header: {
    padding: 24,
    paddingTop: 40,
    paddingBottom: 30,
    backgroundColor: '#F79B00',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    flexDirection: 'row', // row-wise layout
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Medium',
    color: 'white',
    paddingLeft: 16,

  },



  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343a40',
  },
  detailsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailIcon: {
    marginRight: 12,
    width: 24,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6c757d',
    width: 120,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#343a40',
    flex: 1,
  },
  dataCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#343a40',
  },
  editButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#e9f0ff',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    marginRight: 8,
  },
  itemLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginRight: 4,
  },
  itemValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#343a40',
  },
  imagesContainer: {


    paddingHorizontal: 16,
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
    marginBottom: 10
  },
  imageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343a40',
  },
  modalContent: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 8,
    fontSize: 14,
    color: '#495057',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#e9ecef',
  },
  saveButton: {
    backgroundColor: '#4e8cff',
  },
  cancelButtonText: {
    color: '#495057',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  dropdown: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 4,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    marginBottom: 12,
  },
});

export default InspectionListDetails;